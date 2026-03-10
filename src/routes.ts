import { createBrowserRouter } from "react-router";
import { Root } from "./apps/components/root";
import { Home } from "./apps/components/home";
import { ConfessionBox } from "./apps/components/confession-box";
import { Journal } from "./apps/components/journal";
import { MoodTracker } from "./apps/components/mood-tracker";
import { EmergencyResources } from "./apps/components/emergency";
import { WriteALetter } from "./apps/components/writealetter";
import { ReadLetters } from "./apps/components/read-letter";
import { Auth } from "./apps/components/Auth";
import { ReasonsToStayAlive } from "./apps/components/reasonstostayalive";
import { SettingsPage } from "./apps/components/settings";
import { KnowYourselfBetter } from "./apps/components/know-yourself-better";
import { SeekHelpPage } from "./apps/components/seek-help";
import { EmotionalShelter } from "./apps/components/emotional-shelter";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "confess", Component: ConfessionBox },
      { path: "journal", Component: Journal },
      { path: "mood", Component: MoodTracker },
      { path: "emergency", Component: EmergencyResources },
      { path: "write-letter", Component: WriteALetter },
      { path: "read-letters", Component: ReadLetters },
      { path: "auth", Component: Auth },
      { path: "reasons-to-stay", Component: ReasonsToStayAlive },
      { path: "settings", Component: SettingsPage },
      { path: "know-yourself", Component: KnowYourselfBetter },
      { path: "seek-help", Component: SeekHelpPage },
    ],
  },
  {
    path: "/shelter",
    Component: EmotionalShelter,
  },
]);
