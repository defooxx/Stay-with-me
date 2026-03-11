import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Droplets,
  ListTodo,
  Pause,
  Phone,
  Play,
  Sparkles,
  Sunrise,
  Waves,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getEmergencyContactsByCountry } from "../data/emergency-contacts";
import {
  useTranslatedText,
  useTranslatedTexts,
} from "../hooks/useRuntimeTranslation";
import { Card } from "./UI/card";
import { Button } from "./UI/button";

const BREATHING_PHASES = [
  { key: "inhale", label: "Inhale", seconds: 4, scale: 1.08 },
  { key: "hold", label: "Hold", seconds: 4, scale: 1.16 },
  { key: "exhale", label: "Exhale", seconds: 4, scale: 0.92 },
] as const;

const groundingExercises = [
  {
    title: "5-4-3-2-1 grounding",
    description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.",
  },
  {
    title: "Jaw and shoulders reset",
    description: "Relax your tongue, unclench your jaw, and let your shoulders drop on the exhale.",
  },
  {
    title: "Safe place image",
    description: "Picture one place that feels steady, quiet, and safe enough for the next minute.",
  },
];

const careTools = [
  {
    icon: Droplets,
    title: "Drink water",
    description: "Start with one glass. Small body care can interrupt overwhelm.",
  },
  {
    icon: Sunrise,
    title: "Sit near sunlight",
    description: "A little daylight can help the body feel less trapped.",
  },
  {
    icon: ListTodo,
    title: "Do one task only",
    description: "Choose one thing before the next five things.",
  },
];

export function EmergencyResources() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingIndex, setBreathingIndex] = useState(0);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const breathingPhase = BREATHING_PHASES[breathingIndex];
  const selectedExercise = groundingExercises[selectedExerciseIndex];

  const countryCode = user?.countryCode || "US";
  const countryName = user?.countryName || "United States";
  const countryEmergencyResources = getEmergencyContactsByCountry(countryCode, countryName);
  const introCopy = useTranslatedText(
    "This page should reduce decisions. If it is urgent, reach out now. If it is not immediate danger, use one breathing or care step next."
  );
  const urgentHelpFirst = useTranslatedText("Urgent help first");
  const ifCallingFeelsHard = useTranslatedText("If calling feels hard");
  const trustedPersonMessage = useTranslatedText(
    "Message one trusted person in simple words: “I am not feeling safe and I need you with me.”"
  );
  const saferRoomMessage = useTranslatedText(
    "Move closer to another person or a safer room."
  );
  const skipNowHelp = useTranslatedText(
    "Then use `Skip Now` if you need a softer regulation screen immediately."
  );
  const skipNowLabel = useTranslatedText("Skip Now");
  const oneBreathTitle = useTranslatedText("One breath at a time");
  const oneBreathDescription = useTranslatedText(
    "Inhale for 4, hold for 4, exhale for 4. Keep this screen simple enough that a user can follow it while distressed."
  );
  const breathingPhaseLabels = useTranslatedTexts(
    BREATHING_PHASES.map((phase) => phase.label)
  );
  const secondsLabel = useTranslatedText("seconds");
  const breathingPrompts = useTranslatedTexts([
    "Take air in slowly.",
    "Stay still. Nothing to force.",
    "Let your shoulders loosen as you breathe out.",
  ]);
  const breathingFooter = useTranslatedText(
    "This is not about doing it perfectly. It is only about lowering the intensity enough for the next safe step."
  );
  const pauseLabel = useTranslatedText("Pause");
  const startBreathingLabel = useTranslatedText("Start breathing");
  const openFullCareScreen = useTranslatedText("Open full care screen");
  const moreSupportLabel = useTranslatedText("More support");
  const groundingTitle = useTranslatedText("Choose one grounding action");
  const groundingDescription = useTranslatedText(
    "Only one needs to be visible at a time. Pick the one that feels most possible."
  );
  const groundingExerciseTexts = useTranslatedTexts(
    groundingExercises.flatMap((exercise) => [exercise.title, exercise.description])
  );
  const currentSupportFocus = useTranslatedText("Current support focus");
  const careToolsTitle = useTranslatedText("Care tools");
  const careToolsDescription = useTranslatedText(
    "If it is not an immediate crisis, move toward one body-based action instead of trying to solve everything at once."
  );
  const careToolTexts = useTranslatedTexts(
    careTools.flatMap((item) => [item.title, item.description])
  );
  const openBreathingAndCareTools = useTranslatedText(
    "Open breathing and care tools"
  );
  const emergencyResourceTexts = useTranslatedTexts(
    countryEmergencyResources.flatMap((item) => [item.label, item.text, item.linkLabel])
  );

  useEffect(() => {
    if (!breathingActive) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBreathingIndex((current) => (current + 1) % BREATHING_PHASES.length);
    }, breathingPhase.seconds * 1000);

    return () => window.clearTimeout(timeoutId);
  }, [breathingActive, breathingIndex, breathingPhase.seconds]);

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl mb-3">{t("emergencyTitle")}</h1>
        <p className="mx-auto max-w-3xl text-gray-600 dark:text-slate-300">
          {introCopy}
        </p>
      </motion.div>

      <Card className="mb-6 border-red-300 bg-red-50/90 p-5 dark:border-red-700 dark:bg-red-950/35">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex items-center gap-2 text-red-700 dark:text-red-100">
              <AlertTriangle className="size-5" />
              <p className="text-sm font-medium uppercase tracking-[0.24em]">{urgentHelpFirst}</p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-red-900 dark:text-red-100">{t("ifInCrisis")} - {countryName}</h2>
            <p className="mt-2 text-sm leading-6 text-red-800 dark:text-red-200">{t("pleaseReachImmediateHelp")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {countryEmergencyResources.map((item, index) => (
                <div key={item.label} className="rounded-2xl border border-red-200 bg-white/70 p-4 dark:border-red-800 dark:bg-red-950/20">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">{emergencyResourceTexts[index * 3] || item.label}</p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-200">{emergencyResourceTexts[index * 3 + 1] || item.text}</p>
                  <a
                    href={item.link}
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:underline dark:text-red-100"
                  >
                    <Phone className="size-4" />
                    {emergencyResourceTexts[index * 3 + 2] || item.linkLabel}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-red-200 bg-white/75 p-5 dark:border-red-800 dark:bg-red-950/20">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">{ifCallingFeelsHard}</p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-red-800 dark:text-red-200">
              <p>{trustedPersonMessage}</p>
              <p>{saferRoomMessage}</p>
              <p>{skipNowHelp}</p>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:text-red-100 dark:hover:bg-red-900/40"
              onClick={() => navigate("/shelter")}
            >
              {skipNowLabel}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="p-6 bg-white/75 backdrop-blur-md dark:bg-slate-900/55">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300">
            <Waves className="size-5" />
            <p className="text-sm font-medium uppercase tracking-[0.24em]">{t("breathingExercise")}</p>
          </div>
          <h3 className="mt-3 text-2xl font-semibold">{oneBreathTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
            {oneBreathDescription}
          </p>

          <div className="mt-6 flex flex-col items-center text-center">
            <motion.div
              animate={{ scale: breathingActive ? breathingPhase.scale : 1 }}
              transition={{ duration: breathingPhase.seconds, ease: "easeInOut" }}
              className="flex size-64 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-cyan-200 to-indigo-300 shadow-[0_20px_60px_rgba(59,130,246,0.25)]"
            >
              <div className="text-slate-900">
                <p className="text-lg font-medium uppercase tracking-[0.3em]">{breathingPhaseLabels[breathingIndex] || breathingPhase.label}</p>
                <p className="mt-2 text-5xl font-semibold">{breathingPhase.seconds}</p>
                <p className="mt-2 text-base">{secondsLabel}</p>
              </div>
            </motion.div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-900/70">
              <p className="font-medium dark:text-white">
                {breathingPhase.key === "inhale" && breathingPrompts[0]}
                {breathingPhase.key === "hold" && breathingPrompts[1]}
                {breathingPhase.key === "exhale" && breathingPrompts[2]}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                {breathingFooter}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button
                className="rounded-full"
                onClick={() => {
                  setBreathingActive((current) => !current);
                  if (!breathingActive) {
                    setBreathingIndex(0);
                  }
                }}
              >
                {breathingActive ? <Pause className="size-4 mr-2" /> : <Play className="size-4 mr-2" />}
                {breathingActive ? pauseLabel : startBreathingLabel}
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => navigate("/shelter")}>
                {openFullCareScreen}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="p-6 bg-white/75 backdrop-blur-md dark:bg-slate-900/55">
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-300">
              <Sparkles className="size-5" />
              <p className="text-sm font-medium uppercase tracking-[0.24em]">{moreSupportLabel}</p>
            </div>
            <h3 className="mt-3 text-2xl font-semibold">{groundingTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
              {groundingDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {groundingExercises.map((exercise, index) => (
                <button
                  key={exercise.title}
                  type="button"
                  onClick={() => setSelectedExerciseIndex(index)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedExerciseIndex === index
                      ? "border-pink-400 bg-pink-50 text-pink-700 dark:border-pink-500 dark:bg-pink-950/30 dark:text-pink-100"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                  }`}
                >
                  {groundingExerciseTexts[index * 2] || exercise.title}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-sm font-medium">{currentSupportFocus}</p>
              <p className="mt-3 text-base leading-7 text-gray-700 dark:text-slate-200">
                {groundingExerciseTexts[selectedExerciseIndex * 2 + 1] || selectedExercise.description}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <h3 className="text-2xl font-semibold">{careToolsTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
              {careToolsDescription}
            </p>
            <div className="mt-4 space-y-3">
              {careTools.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-900 px-3 py-3 dark:bg-white/10">
                        <Icon className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{careToolTexts[index * 2] || item.title}</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{careToolTexts[index * 2 + 1] || item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="mt-5 w-full" onClick={() => navigate("/shelter")}>
              {openBreathingAndCareTools}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
