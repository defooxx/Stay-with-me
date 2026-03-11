import { createBrowserRouter } from "react-router";
import { Root } from "./apps/components/root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, lazy: async () => ({ Component: (await import("./apps/components/home")).Home }) },
      { path: "confess", lazy: async () => ({ Component: (await import("./apps/components/confession-box")).ConfessionBox }) },
      { path: "journal", lazy: async () => ({ Component: (await import("./apps/components/journal")).Journal }) },
      { path: "mood", lazy: async () => ({ Component: (await import("./apps/components/mood-tracker")).MoodTracker }) },
      { path: "emergency", lazy: async () => ({ Component: (await import("./apps/components/emergency")).EmergencyResources }) },
      { path: "write-letter", lazy: async () => ({ Component: (await import("./apps/components/writealetter")).WriteALetter }) },
      { path: "read-letters", lazy: async () => ({ Component: (await import("./apps/components/read-letter")).ReadLetters }) },
      { path: "auth", lazy: async () => ({ Component: (await import("./apps/components/Auth")).Auth }) },
      { path: "reasons-to-stay", lazy: async () => ({ Component: (await import("./apps/components/reasonstostayalive")).ReasonsToStayAlive }) },
      { path: "settings", lazy: async () => ({ Component: (await import("./apps/components/settings")).SettingsPage }) },
      { path: "know-yourself", lazy: async () => ({ Component: (await import("./apps/components/know-yourself-better")).KnowYourselfBetter }) },
      { path: "seek-help", lazy: async () => ({ Component: (await import("./apps/components/seek-help")).SeekHelpPage }) },
    ],
  },
  {
    path: "/shelter",
    lazy: async () => ({ Component: (await import("./apps/components/emotional-shelter")).EmotionalShelter }),
  },
]);
