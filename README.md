# Vocabularify

A calm, fully-offline vocabulary-learning app built with Expo / React Native. It shows flashcards (a word in the language you're learning plus its translation), auto-advances on a timer, and lets you swipe between cards. All data is bundled or stored locally — there is **no backend, no account, and no network access**.

- **Stack:** Expo SDK 52 · React Native 0.76 · React 18.3 · TypeScript (strict)
- **Styling:** NativeWind v4 (Tailwind for RN) — a "midnight gallery" design system (dark-first near-black surfaces, a single brushed-brass accent, true-neutral light mode; Fraunces display + Plus Jakarta Sans)
- **Navigation:** React Navigation v6 (manual, not file-based routing)
- **State:** React Context + hooks, persisted with AsyncStorage
- **Animation:** react-native-reanimated + react-native-gesture-handler
- **Tests:** Jest (`jest-expo`) + React Native Testing Library

## Prerequisites

- **Node 22** (an `.nvmrc` is included — run `nvm use`)
- **Xcode** (for the iOS simulator) and/or **Android Studio** (for an Android emulator)
- For device builds: an [Expo / EAS](https://expo.dev) account and the EAS CLI (`npm i -g eas-cli`)

> Note: there is intentionally **no Docker setup**. Containers cannot run the iOS/Android simulators (those require the host OS), and Metro/Expo are designed to run on the host, so Docker would add friction without benefit for this project.

## Getting started

```bash
nvm use          # Node 22
npm install      # installs deps; postinstall applies patches/ (patch-package)
npm start        # Expo dev server — press i (iOS), a (Android), or w (web)
```

Or target a platform directly:

```bash
npm run ios       # open in iOS simulator
npm run android   # open in Android emulator
npm run web       # open in the browser (react-native-web)
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` / `android` / `web` | Launch on a specific platform |
| `npm test` | Run the Jest suite once |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with a coverage report |
| `npm run lint` | ESLint via `expo lint` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build:ios` / `build:android` | EAS production build |
| `npm run submit:ios` / `submit:android` | EAS store submission |

## Architecture

```
app/
  index.js              # Entry: registerRootComponent → providers → navigation
  context/              # ThemeContext (light/dark/system), LanguageContext (settings/mode/frequency)
  navigation/           # BottomTabNavigator (Home + Settings) and the Settings stack
  screens/              # Home, Welcome (onboarding), Settings, LearningMode, LanguageSettings, Background, About
  components/           # Shared UI primitives (Card, Section, ListRow, Button, ProgressBar, LanguageSelector, …)
  hooks/                # useWordList, useFlashcardDeck, useThemeColors
  services/             # storage.ts — typed AsyncStorage wrapper (validation + migration)
  theme/                # tokens.ts — single source of truth for colors/spacing/radii/motion
  utils/                # types, constants, loadLanguageFile (static word-list lookup)
languages/<learning>/<known>/<level>.json   # bundled word lists ([{ word_1, word_2 }])
```

**Routing is manual React Navigation**, even though this is an Expo app — the entry point is `app/index.js` via `registerRootComponent`. There is no file-based routing; do not add route files expecting them to be picked up.

**Styling** uses NativeWind `className`. The visual identity is "midnight gallery": dark is the signature scheme (near-black surfaces, warm off-white ink, a single **brushed-brass** jewel accent used sparingly), and light mode is a true-neutral gallery white (deliberately not a warm cream). Type pairs **Fraunces** (display / the flashcard word) with **Plus Jakarta Sans** (UI). Colors flip between light/dark via CSS variables in `global.css`, referenced from `tailwind.config.js`. Anything that can't take a class (reanimated worklets, navigation options, the status bar) reads the same values from `app/theme/tokens.ts` — **keep `global.css` and `tokens.ts` in sync; they are the single source of truth.**

**Word data flow.** Vocabulary lives in static JSON arrays of `{ word_1, word_2 }` under `languages/<learning>/<known>/<level>.json`. `app/utils/loadLanguageFile.ts` maps a `learning-known-level` key to a `require()`'d file (Metro needs static requires). `useWordList` loads the array; `useFlashcardDeck` owns the current index, auto-advance timer, wrap-around, and reveal behavior; `HomeScreen` is a thin presentational layer over those hooks plus the swipe gesture.

> **Naming note:** in `settings`, `learningLanguage` is the language being learned (rendered as `word_1`) and `knownLanguage` is the user's known language (`word_2`). Settings persisted by older versions used `fromLanguage`/`toLanguage`; `app/services/storage.ts` migrates that shape automatically on read.

## Adding a language pair or level

Three places must stay in sync:

1. **Add the JSON file** at `languages/<learning>/<known>/<level>.json` — an array of `{ "word_1": "…", "word_2": "…" }`.
2. **Register it** in the lookup map in `app/utils/loadLanguageFile.ts` (the static `require` is what bundles the file).
3. **Expose the combination** in `availableCombinations` (and `languages` / `levels` if new) in `app/utils/types.ts` so the selector offers it.

## Building & submitting

See [docs/STORE_SUBMISSION.md](docs/STORE_SUBMISSION.md) for the full App Store / Google Play checklist. In short:

```bash
eas login
eas build -p ios       # or: npm run build:ios
eas build -p android   # or: npm run build:android
eas submit -p ios      # or: npm run submit:ios
eas submit -p android  # or: npm run submit:android
```

The app collects and transmits no data — see [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md), which backs the "Data Not Collected" declaration on both stores.
