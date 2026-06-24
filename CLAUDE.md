# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vocabularify is a fully-offline Expo / React Native vocabulary-learning app (Expo SDK 52, RN 0.76, React 18.3, TypeScript strict). It shows flashcards (a word in the language being learned plus its translation), auto-advances on a timer, and lets the user swipe between cards. Settings, theme, and progress are persisted locally via `AsyncStorage`. There is **no backend and no network access** — the only outbound action is `Linking.openURL` for donation/author links.

## Commands

```bash
npm start            # expo start (dev server)
npm run ios          # open in iOS simulator
npm run android      # open in Android emulator
npm run web          # run in browser (react-native-web)
npm test             # jest (jest-expo preset), run once
npm run test:watch   # jest watch mode
npm run test:coverage
npm run lint         # expo lint
npm run typecheck    # tsc --noEmit
npm run build:ios | build:android       # eas production build
npm run submit:ios | submit:android     # eas store submission
```

Run a single test: `npx jest path/to/file.test.tsx` (or `-t "test name"`).

## Architecture

**Entry point is `app/index.js`**, registered via `registerRootComponent`. **Routing is manual React Navigation v6** — there is no file-based routing (expo-router was removed). Do not add route files expecting them to be picked up.

Navigation tree:
- Root `StackNavigator` (`app/index.js`): shows `WelcomeScreen` on first launch (no saved settings), then `Main`.
- `Main` → `BottomTabNavigator` (`app/navigation/`): `Home` + `Settings` tabs.
- `Settings` → `SettingsStackNavigator`: Settings, LearningMode, LanguageSettings, About, Background.

**Layout** (all under `app/`): `context/`, `navigation/`, `screens/`, `components/` (shared UI primitives), `hooks/`, `services/`, `theme/`, `utils/`.

**State** lives in two contexts (`app/context/`), both wrapping the app in `index.js`:
- `ThemeContext` — `light`/`dark`/`system`; drives NativeWind's `colorScheme` so the `.dark` class flips the palette app-wide. Persisted under the `theme` key.
- `LanguageContext` — `settings` (`{ learningLanguage, knownLanguage, level }`), `mode`, `frequency`. Reads/writes go through the storage service.

**Persistence is centralized** in `app/services/storage.ts` — a typed `AsyncStorage` wrapper that safely parses, validates, and migrates stored data (never trust raw JSON). It also migrates the legacy `{ fromLanguage, toLanguage }` settings shape (see naming note) to the current one on read.

**Word data flow:** static JSON arrays of `{ word_1, word_2 }` live under `languages/<learning>/<known>/<level>.json`. `app/utils/loadLanguageFile.ts` maps a `learning-known-level` key to a `require()`'d file via a typed lookup map (Metro needs static requires). `useWordList` loads the array; `useFlashcardDeck` owns current index, auto-advance timer, wrap-around, and the reveal-after-delay for "word then translation" mode; `HomeScreen` is a thin presentational layer over those hooks plus the swipe gesture (reanimated + gesture-handler).

**Naming note:** in `settings`, `learningLanguage` is the language being *learned* (rendered as `word_1`) and `knownLanguage` is the user's known language (`word_2`). Older builds persisted these as `fromLanguage`/`toLanguage` (inverted-sounding names); the storage service migrates that automatically. Word files are bundled statically — they cannot be loaded by dynamic path.

## Styling (NativeWind v4)

- Visual identity is **"midnight gallery"**: dark is the signature scheme (near-black surfaces, warm off-white ink, a single brushed-brass jewel accent used sparingly — primary actions, active tab, the flashcard glow); light mode is a true-neutral gallery white (not a warm cream). Avoid reintroducing warm-paper/cream backgrounds or tracked-uppercase eyebrow labels above headings — both were deliberately removed as generic.
- Style with `className`. The palette flips light/dark via CSS variables in `global.css`, referenced by `tailwind.config.js` (`darkMode: 'class'`).
- **`app/theme/tokens.ts` is the single source of truth** for colors/spacing/radii/fonts/motion, and must stay in sync with `global.css`. Anything that can't take a class (reanimated worklets, navigation options, StatusBar) must read from tokens — do not hardcode hex.
- Fonts: Plus Jakarta Sans (`font-sans`, UI) and Fraunces (`font-display`, the flashcard word / big titles).
- Motion via reanimated, kept restrained: ease-out for enters, springs for the swipe gesture, press-scale ~0.97, and `useReducedMotion()` honored everywhere.
- A patch (`patches/react-native-css-interop+0.2.5.patch`, applied via `postinstall`) is required because that package references a reanimated-4-only worklets plugin; keep it when bumping deps.

## Adding a language pair or level

The static require map and language metadata are **generated**, not hand-edited:
1. Add the JSON file at `languages/<learning>/<known>/<level>.json` (array of `{ "word_1": "...", "word_2": "..." }`), using the 2-letter code dirs (`en`, `de`, …).
2. Run `npm run generate:languages`. This scans `languages/` and regenerates `app/utils/loadLanguageFile.ts` (the static `require` map Metro bundles) and `app/utils/languageData.ts` (`languages` / `levels` / `availableCombinations` / `LANGUAGE_META`). Both files carry a `DO NOT EDIT` header — never hand-edit them; `app/utils/types.ts` re-exports the data from `languageData.ts`.
3. The generator's `META` map (`scripts/generate-language-map.js`) is the single source of truth for code↔name↔flag and mirrors Desktop's `LANGUAGE_META`; add a new language there first. Commit the regenerated output. The parity guard test (`__tests__/unit/languageParity.test.ts`) verifies every pair resolves to a real on-disk file.

## Testing

`jest-expo` preset; setup in `jest.setup.ts` mocks AsyncStorage, reanimated, gesture-handler, and `expo-font`. Tests in `__tests__/` cover logic (storage migration, loader, `useFlashcardDeck` with fake timers) and smoke-render each screen via `renderWithProviders`. Keep logic modules well covered.

## Conventions

- TypeScript `strict`; path alias `@/*` maps to repo root.
- Screens/components are `.tsx`; the app entry is intentionally `.js`.
- Prefer the shared primitives in `app/components/` and the hooks/services over re-implementing UI or storage logic in screens.
