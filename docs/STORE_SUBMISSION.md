# Store Submission Guide

Vocabularify ships to the **Apple App Store** and **Google Play** via [EAS Build & Submit](https://docs.expo.dev/submit/introduction/). The app is fully offline and collects no data, which keeps the privacy paperwork simple.

## 0. One-time setup

- Install the CLI: `npm i -g eas-cli` and `eas login`.
- Confirm the project is linked: `extra.eas.projectId` in `app.json` is already set.
- Versioning is configured in `eas.json` (`cli.appVersionSource: "local"`, `production.autoIncrement: true`). The marketing version is `expo.version` in `app.json`; iOS `buildNumber` / Android `versionCode` auto-increment per production build.

## 1. Bump the version

- Update `expo.version` in `app.json` **and** `version` in `package.json` for a user-facing release (currently `1.2.0`). `runtimeVersion.policy` is `appVersion`, so the runtime version tracks it.
- The native build numbers (`ios.buildNumber`, `android.versionCode`) auto-increment on EAS production builds — no manual edits needed.

## 2. Build

```bash
npm run build:ios       # eas build -p ios --profile production
npm run build:android   # eas build -p android --profile production
```

- iOS produces a `.ipa`; the first build will walk you through Apple credentials (let EAS manage them unless you have a reason not to).
- Android produces an `.aab`. The first build generates/uploads a keystore (EAS-managed by default).

## 3. Submit

```bash
npm run submit:ios       # uses submit.production.ios in eas.json
npm run submit:android   # uses submit.production.android in eas.json
```

- **iOS** submit config (`appleId`, `ascAppId`, `appleTeamId`) is in `eas.json`. The build lands in App Store Connect → TestFlight; promote to review from there.
- **Android** requires a Play service-account JSON. Place it at `./credentials/play-store-service-account.json` (path set in `eas.json`; the `credentials/` folder is git-ignored). It first lands on the `internal` track.

## 4. Store assets checklist

| Asset | Status / where |
| --- | --- |
| App icon (1024×1024, no alpha for iOS) | `assets/images/icon.png` — verify it's 1024² and opaque |
| Android adaptive icon | `assets/images/adaptive-icon.png` (foreground) + `#F7F5F1` background in `app.json` |
| Splash screen | `assets/images/splash.png` (light `#F7F5F1` / dark `#0E0E10`) |
| iOS screenshots | Required: 6.7" and 6.5" iPhone; 12.9" iPad if `supportsTablet`. Capture in light **and** dark. |
| Android screenshots | Phone (min 2) + feature graphic 1024×500 |
| App description / keywords / subtitle | Draft for both stores |
| Support URL / marketing URL | e.g. https://ehuseynov.net |
| Privacy policy URL | Host `docs/PRIVACY_POLICY.md` and link it (required by both stores) |

> Re-export the icon at 1024×1024 if needed: the current `icon.png` is large but confirm dimensions before submitting (App Store rejects non-1024² or icons with an alpha channel).

## 5. Privacy declarations

The app stores only local preferences (selected languages, level, mode, frequency, last card index) on-device via AsyncStorage and makes **no network requests** except user-initiated "open in browser" taps (donation / author links). Declare accordingly:

- **Apple App Privacy:** *Data Not Collected.*
- **Google Play Data Safety:** No data collected, no data shared.

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md).

## 6. Pre-submission sanity checks

```bash
npm run typecheck && npm run lint && npm test
npx expo-doctor
npx expo export --platform ios   # confirms the production bundle builds
```
