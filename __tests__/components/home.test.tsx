import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { renderWithProviders, screen, waitFor, fireEvent } from "./test-utils";
import { markDeckMoved, resetDeckSignal } from "../../app/services/deckSignal";
import { resetTourSignal } from "../../app/services/tourSignal";
import { STORAGE_KEYS } from "../../app/services/storage";

// Deterministic word list so HomeScreen renders a known first word + total.
const STUB_WORDS = [
  { word_1: "apfel", word_2: "apple" },
  { word_1: "banane", word_2: "banana" },
  { word_1: "kirsche", word_2: "cherry" },
];

// A one-lesson course over the same stub words: two words, then a sentence
// built from them. `null` by default, so most tests still see a flat deck.
const STUB_LESSONS = [
  {
    count: 2,
    sentences: [
      {
        id: "a1_001",
        target: [{ t: "Apfel", c: "apple" }, "!"],
        source: "Яблоко!",
        gloss: { apple: { t: "der Apfel", s: "яблоко" } },
      },
    ],
  },
];

const mockLoadLessons = jest.fn(async () => null as unknown);

jest.mock("../../app/utils/loadLanguageFile", () => ({
  __esModule: true,
  default: jest.fn(async () => STUB_WORDS),
  loadLessonsFile: (...args: unknown[]) => mockLoadLessons(...(args as [])),
}));

const mockNavigation: any = { navigate: jest.fn(), goBack: jest.fn() };
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigation,
}));

import HomeScreen from "../../app/screens/HomeScreen";

beforeEach(async () => {
  await AsyncStorage.clear();
  // The walkthrough opens over the deck on a first run and would sit on top of
  // every assertion below. The tests that want it set the flag back.
  await AsyncStorage.setItem(STORAGE_KEYS.homeTour, JSON.stringify(true));
  mockLoadLessons.mockResolvedValue(null);
  resetDeckSignal();
  resetTourSignal();
});

describe("HomeScreen", () => {
  it("renders the current word and a zero-padded progress counter from the stubbed list", async () => {
    await renderWithProviders(<HomeScreen />);

    // First word_1 renders.
    expect(await screen.findByText("apfel")).toBeTruthy();
    // Its translation (word_2) renders (ShowBoth is the default mode).
    expect(screen.getByText("apple")).toBeTruthy();
    // Progress counter shows the padded current index (01) and total (03).
    expect(screen.getByText("01")).toBeTruthy();
    expect(screen.getByText("03")).toBeTruthy();
  });

  it("resumes from the persisted last index", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.deckIndex,
      JSON.stringify({ "german:english:a1": 2 }),
    );
    await renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText("kirsche")).toBeTruthy();
      // Current index 3 of 3 - both render as "03".
      expect(screen.getAllByText("03").length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe("HomeScreen - interface language", () => {
  it("writes its hints in the language the learner already speaks", async () => {
    await renderWithProviders(<HomeScreen />, {
      settings: { learningLanguage: "german", knownLanguage: "russian" },
    });

    expect(await screen.findByText("свайп, чтобы продолжить")).toBeTruthy();
    expect(screen.queryByText("swipe to continue")).toBeNull();
  });
});

describe("HomeScreen - moved from elsewhere", () => {
  it("re-reads the stored position when the deck signal fires", async () => {
    await renderWithProviders(<HomeScreen />);
    expect(await screen.findByText("apfel")).toBeTruthy();

    // What the Progress screen does: write the position, then say so.
    await AsyncStorage.setItem(
      STORAGE_KEYS.deckIndex,
      JSON.stringify({ "german:english:a1": 2 }),
    );
    markDeckMoved();

    await waitFor(() => {
      expect(screen.getByText("kirsche")).toBeTruthy();
    });
  });
});

describe("HomeScreen with a course", () => {
  it("shows the lesson's sentence after its words, with a tappable gloss", async () => {
    mockLoadLessons.mockResolvedValue(STUB_LESSONS as unknown);
    await AsyncStorage.setItem(
      STORAGE_KEYS.deckIndex,
      // Two words, then the sentence: item 2 is the sentence.
      JSON.stringify({ "german:english:a1": 2 }),
    );
    await renderWithProviders(<HomeScreen />);

    // The sentence renders token by token, with its translation under it.
    expect(await screen.findByText("Apfel")).toBeTruthy();
    expect(screen.getByText("Яблоко!")).toBeTruthy();
    // Lesson 1 of 1, and the hint names the lesson swipe.
    expect(screen.getByText("lesson 1 / 1")).toBeTruthy();

    // Tapping the underlined word replaces the prompt with its citation form.
    expect(screen.getByText("tap an underlined word")).toBeTruthy();
    fireEvent.press(screen.getByTestId("sentence-token-0"));
    await waitFor(() => {
      expect(screen.getByText(/der Apfel .+ яблоко/)).toBeTruthy();
      expect(screen.queryByText("tap an underlined word")).toBeNull();
    });
  });
});

describe("HomeScreen - the first-run walkthrough", () => {
  it("opens over the deck once, and does not come back", async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.homeTour);
    const { unmount } = await renderWithProviders(<HomeScreen />);

    // It waits for the deck, so the hole is measured around a card and not
    // around the spinner that was there a moment earlier.
    expect(await screen.findByText("The card")).toBeTruthy();
    expect(screen.getByText(/word you are learning is on top/)).toBeTruthy();

    fireEvent.press(screen.getByText("Next"));
    expect(await screen.findByText("Swipe sideways")).toBeTruthy();

    // A flat deck has no lessons, so the two lesson steps are not offered and
    // the next one is the last.
    fireEvent.press(screen.getByText("Next"));
    expect(await screen.findByText("Where you are")).toBeTruthy();

    fireEvent.press(screen.getByText("Start"));
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(STORAGE_KEYS.homeTour)).toBe("true");
    });
    expect(screen.queryByText("Where you are")).toBeNull();

    unmount();
    await renderWithProviders(<HomeScreen />);
    await screen.findByText("apfel");
    expect(screen.queryByText("The card")).toBeNull();
  });

  it("explains lessons and sentences only on a deck that has them", async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.homeTour);
    mockLoadLessons.mockResolvedValue(STUB_LESSONS as unknown);
    await renderWithProviders(<HomeScreen />);

    await screen.findByText("The card");
    fireEvent.press(screen.getByText("Next"));
    await screen.findByText("Swipe sideways");
    fireEvent.press(screen.getByText("Next"));
    expect(await screen.findByText("Swipe up or down")).toBeTruthy();
    fireEvent.press(screen.getByText("Next"));
    expect(await screen.findByText("Then sentences")).toBeTruthy();
  });

  it("Skip closes it and still counts as seen", async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.homeTour);
    await renderWithProviders(<HomeScreen />);

    await screen.findByText("The card");
    fireEvent.press(screen.getByText("Skip"));

    await waitFor(async () => {
      expect(await AsyncStorage.getItem(STORAGE_KEYS.homeTour)).toBe("true");
    });
    expect(screen.queryByText("The card")).toBeNull();
  });
});
