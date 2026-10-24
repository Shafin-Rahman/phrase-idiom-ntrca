# Phrase & Idiom Master

Offline React Native (Expo) conversion of the Google AI Studio Android app for BCS and NTRCA phrase/idiom preparation.

## Features

- 421 curated phrases: Previous BCS (17), Previous NTRCA (106), and Alphabetical A–Z (298)
- Bengali and English meanings, examples, exam history, mnemonics, and exam tips
- Search plus category, letter, study-part, bookmark, mistake, and mastery filters
- Text-to-speech with per-phrase repeat counts, play-all/English-only modes, pause/resume/stop, and speech-rate control
- Six exam modes: study set, category, alphabet, incorrect review, bookmarks, and full-dataset practice
- Flashcard revision, incorrect-item review, and bookmarked-item review
- Progress persisted locally with AsyncStorage (bookmarks, mastery, study counts, exam results, daily target)
- Light/dark theme and fully offline data

## Requirements

- Node.js 20+
- Expo Go on an Android device, or an Android emulator with Expo tooling
- A Bengali TTS voice installed on the device for Bengali audio (Android Settings → Accessibility → Text-to-speech output)

## Run locally

```bash
npm install
npm start
```

Then scan the QR code with Expo Go or press `a` to launch an available Android emulator.

Validate the project:

```bash
npm run typecheck
npx expo-doctor
npx expo export --platform android
```

## Android builds with EAS

```bash
npx eas-cli login
npx eas-cli init          # first time only, links/creates the EAS project
npm run build:android:preview   # installable APK
npm run build:android           # Play Store AAB
```

`eas.json` includes development, preview (APK), and production (AAB) profiles. The Android package ID is `com.aistudio.idiommemo.rxkwpl`, matching the original app.

## Project layout

- `App.tsx` — app shell, tab navigation, Android back handling, floating audio bar
- `src/AppContext.tsx` — progress state, quiz flow, filtering, and TTS wrappers
- `src/tts.ts` — speech sequence engine and voice detection
- `src/data/` — JSON dataset parsing and curated mnemonics
- `src/screens/` — Home, Study, Exam, Revision, and Settings screens
- `src/components/` — shared cards, controls, dialogs, and audio UI
- `assets/` — original phrase dataset, mapping data, and app icons
