# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vocabularify is a fully-offline Expo / React Native vocabulary-learning app (Expo SDK 57, RN 0.86, React 19, TypeScript strict). It shows flashcards (a word in the language being learned plus its translation), auto-advances on a timer, and lets the user swipe between cards. Settings, theme, and progress are persisted locally via `AsyncStorage`. There is **no backend and no network access** - the only outbound action is `Linking.openURL` for donation/author links.

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

**Entry point is `app/index.js`**, registered via `registerRootComponent`. **Routing is manual React Navigation v7** - there is no file-based routing (expo-router was removed). Do not add route files expecting them to be picked up.

Navigation tree:

- Root `StackNavigator` (`app/index.js`): shows `WelcomeScreen` on first launch (no saved settings), then `Main`.
- `Main` → `BottomTabNavigator` (`app/navigation/`): `Home` + `Settings` tabs.
- `Settings` → `SettingsStackNavigator`: Settings, LearningMode, LanguageSettings, About, Background.

**Layout** (all under `app/`): `context/`, `navigation/`, `screens/`, `components/` (shared UI primitives), `hooks/`, `services/`, `theme/`, `utils/`.

**State** lives in two contexts (`app/context/`), both wrapping the app in `index.js`:

- `ThemeContext` - `light`/`dark`/`system`; drives NativeWind's `colorScheme` so the `.dark` class flips the palette app-wide. Persisted under the `theme` key.
- `LanguageContext` - `settings` (`{ learningLanguage, knownLanguage, level }`), `mode`, `frequency`. Reads/writes go through the storage service.

**Persistence is centralized** in `app/services/storage.ts` - a typed `AsyncStorage` wrapper that safely parses, validates, and migrates stored data (never trust raw JSON). It also migrates the legacy `{ fromLanguage, toLanguage }` settings shape (see naming note) to the current one on read.

**Word data flow:** static JSON arrays of `{ word_1, word_2 }` live under `languages/<learning>/<known>/<level>.json`. `app/utils/loadLanguageFile.ts` maps a `learning-known-level` key to a `require()`'d file via a typed lookup map (Metro needs static requires).

**Lessons and sentences:** a level may also ship `languages/<learning>/<known>/<level>.lessons.json`, a course laid out as lessons: `{ lessons: [{ count, sentences: [{ id, target, source, gloss }] }] }`. `count` is how many words of the word file belong to that lesson; `target` is the sentence in the language being learned, split into tokens (`{ t, c }` for a word backed by a taught concept, a bare string for glue - punctuation and obligatory articles); `gloss` maps concept id to `{ t: citation form, s: its translation }`.

`app/utils/items.ts` turns a word list plus a course into the item list the deck cycles through - a lesson's words, then its sentences, then the next lesson - and owns the token-spacing rule. It mirrors Desktop's `src/shared/items.ts`; keep the two in step. A level with no course file yields the flat word list, so nothing regresses for the levels still awaiting one. As of the German A1 course, all 42 pairs ship an A1 course; only the six `de/*` ones cover the whole word file.

`useItems` loads word file + course and assembles both; `useFlashcardDeck` owns the position, the auto-advance timer (a sentence holds the screen `SENTENCE_DWELL_MULTIPLIER` times as long as a word), wrap-around, lesson jumps, and the reveal-after-delay for "word then translation" mode. `HomeScreen` is a thin presentational layer over those hooks plus the swipe gesture (reanimated + gesture-handler): sideways moves one card, up and down moves a whole lesson. The pan handler wraps the whole card area rather than the card, which is only as tall as its own text - on the card, a drag registered on the word and nowhere else. The card sits inside a hairline border that takes on the direction of the drag - `swipeForward` green going forward, `swipeBack` yellow going back - reaching full colour at the distance that commits the move, so one hairline answers both which way and far enough yet.

**Naming note:** in `settings`, `learningLanguage` is the language being _learned_ and `knownLanguage` is the user's known language. On disk that is inverted: `word_1` holds the known language and `word_2` the one being learned, and the card shows `word_2` large with `word_1` underneath. Older builds persisted the settings as `fromLanguage`/`toLanguage`; the storage service migrates that automatically. Word files are bundled statically - they cannot be loaded by dynamic path.

**Position** is stored per deck (`<learning>:<known>:<level>`) under the `deckProgress` key, so switching pair or level no longer discards where the learner was. The index counts items, not words.

## Styling (NativeWind v4)

- The palette is **Desktop's**, converted from its OKLCH source to sRGB once in `app/theme/tokens.ts` (each colour carries its OKLCH triple in a comment). Desktop's `index.html` holds the authoritative values; a change on either side is a mechanical re-conversion, not a re-eyeballing. Dark is the signature: a cool near-black field lit by one brass source; light is a cool paper white, not a warm cream. Avoid reintroducing warm-paper backgrounds or tracked-uppercase eyebrow labels - both were deliberately removed as generic.
- `app/components/AmbientBackground.tsx` draws Desktop's two radial gradients - the vignette where light pools at the top, and the brass glow behind the card - as stacks of concentric circles, because RN has no radial gradient and the app carries no gradient library.
- Style with `className`. The palette flips light/dark via CSS variables in `global.css`, referenced by `tailwind.config.js` (`darkMode: 'class'`).
- **`app/theme/tokens.ts` is the single source of truth** for colors/spacing/radii/fonts/motion, and must stay in sync with `global.css`. Anything that can't take a class (reanimated worklets, navigation options, StatusBar) must read from tokens - do not hardcode hex.
- **No bundled fonts.** Desktop renders in the system UI face and carries its voice in weight and tracking; the app does the same by leaving `fontFamily` unset, which gives San Francisco on iOS and Roboto on Android. `font-medium` / `font-semibold` / `font-bold` are Tailwind weight utilities again - do not re-add a `fontFamily` map to `tailwind.config.js`.
- Motion via reanimated, kept restrained: ease-out for enters, springs for the swipe gesture, press-scale ~0.97, and `useReducedMotion()` honored everywhere.
- Reanimated 4 does the animating, with `react-native-worklets` as its runtime. The project used to carry two `patch-package` patches; both are gone. One quoted a path in a React Native build script, which RN 0.86 does itself, and the other stripped the worklets babel plugin out of `react-native-css-interop` for a Reanimated 3 tree, which no longer applies. There is no `postinstall` step any more.

## Adding a language pair or level

The static require map and language metadata are **generated**, not hand-edited:

1. Add the JSON file at `languages/<learning>/<known>/<level>.json` (array of `{ "word_1": "...", "word_2": "..." }`), using the 2-letter code dirs (`en`, `de`, …).
2. Optionally add the course at `languages/<learning>/<known>/<level>.lessons.json` - copy it from Desktop rather than writing it here; Desktop's `utils/generate_pairs.js` produces both files together, and its lint is what guarantees a sentence uses only words already taught.
3. Run `npm run generate:languages`. This scans `languages/` and regenerates `app/utils/loadLanguageFile.ts` (the static `require` maps Metro bundles, for both word files and course files) and `app/utils/languageData.ts` (`languages` / `levels` / `availableCombinations` / `LANGUAGE_META`). Both files carry a `DO NOT EDIT` header - never hand-edit them; `app/utils/types.ts` re-exports the data from `languageData.ts`.
4. The generator's `META` map (`scripts/generate-language-map.js`) is the single source of truth for code↔name↔flag and mirrors Desktop's `LANGUAGE_META`; add a new language there first. Commit the regenerated output. The parity guard tests (`__tests__/unit/languageParity.test.ts`) verify every pair resolves to a real on-disk file, and that each course fits its word file - which is what catches a stale or half-finished copy from Desktop.

## Testing

`jest-expo` preset; setup in `jest.setup.ts` mocks AsyncStorage, reanimated, gesture-handler, and `expo-font`. `jest.resolver.js` strips the `.native` extensions for `react-native-worklets` only, then defers to React Native's resolver - without it Reanimated 4 pulls a native module that does not exist under jest. Testing Library 14 made `render` and `renderHook` async, so every call site awaits. Tests in `__tests__/` cover logic (storage migration, loader, `useFlashcardDeck` with fake timers) and smoke-render each screen via `renderWithProviders`. Keep logic modules well covered.

## Conventions

- TypeScript `strict`; path alias `@/*` maps to repo root.
- Screens/components are `.tsx`; the app entry is intentionally `.js`.
- Prefer the shared primitives in `app/components/` and the hooks/services over re-implementing UI or storage logic in screens.
