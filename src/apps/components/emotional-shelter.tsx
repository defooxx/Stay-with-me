import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Heart,
  Play,
  Sparkles,
  Sunrise,
  TimerReset,
  Waves,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./UI/button";
import { Card } from "./UI/card";
import { Input } from "./UI/input";
import { Slider } from "./UI/slider";
import { Textarea } from "./UI/textarea";
import {
  useTranslatedText,
  useTranslatedTexts,
} from "../hooks/useRuntimeTranslation";

type WaterState = {
  amountMl: number;
  goalIndex: number;
  message: string;
};

type TaskState = {
  id: number;
  text: string;
  done: boolean;
};

type ShelterActivity = {
  id: number;
  userId: string;
  category: string;
  title: string;
  detail: string;
  createdAt: string;
};

type GroundingAnswers = {
  see: string;
  touch: string;
  hear: string;
  smell: string;
  taste: string;
};

type CareSection = "water" | "sunlight" | "focus";

const WATER_GOALS = [1000, 2000, 3500];
const WATER_STORAGE_KEY = "emotional_shelter_water";
const TASK_STORAGE_KEY = "emotional_shelter_tasks";
const SUNLIGHT_STORAGE_KEY = "emotional_shelter_sunlight_minutes";
const GROUNDING_STORAGE_KEY = "emotional_shelter_grounding";
const ACTIVITY_STORAGE_KEY = "staywithme_activities";

const BREATHING_PHASES = [
  { key: "inhale", label: "Inhale", seconds: 4, affirmation: "Breathe with me. You are safe enough for this breath." },
  { key: "hold", label: "Hold", seconds: 4, affirmation: "Nothing to force. Let this pause hold you." },
  { key: "exhale", label: "Exhale", seconds: 4, affirmation: "Let some of the weight leave your body." },
] as const;

const GROUNDING_PROMPTS: Array<{ key: keyof GroundingAnswers; question: string; placeholder: string }> = [
  { key: "see", question: "Name 5 things you can see.", placeholder: "I can see..." },
  { key: "touch", question: "Name 4 things you can touch.", placeholder: "I can touch..." },
  { key: "hear", question: "Name 3 things you can hear.", placeholder: "I can hear..." },
  { key: "smell", question: "Name 2 things you can smell.", placeholder: "I can smell..." },
  { key: "taste", question: "Name 1 thing you can taste.", placeholder: "I can taste..." },
];

const DEFAULT_TASKS = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  text: "",
  done: false,
}));

const DEFAULT_GROUNDING_ANSWERS: GroundingAnswers = {
  see: "",
  touch: "",
  hear: "",
  smell: "",
  taste: "",
};

function readWaterState(): WaterState {
  if (typeof window === "undefined") {
    return { amountMl: 0, goalIndex: 0, message: "Your first shelter goal is 1 L of water today." };
  }

  try {
    const saved = localStorage.getItem(WATER_STORAGE_KEY);
    if (!saved) {
      return { amountMl: 0, goalIndex: 0, message: "Your first shelter goal is 1 L of water today." };
    }

    const parsed = JSON.parse(saved) as Partial<WaterState>;
    return {
      amountMl: parsed.amountMl ?? 0,
      goalIndex: parsed.goalIndex ?? 0,
      message: parsed.message ?? "Your first shelter goal is 1 L of water today.",
    };
  } catch {
    return { amountMl: 0, goalIndex: 0, message: "Your first shelter goal is 1 L of water today." };
  }
}

function readTasks(): TaskState[] {
  if (typeof window === "undefined") {
    return DEFAULT_TASKS;
  }

  try {
    const saved = localStorage.getItem(TASK_STORAGE_KEY);
    if (!saved) {
      return DEFAULT_TASKS;
    }

    const parsed = JSON.parse(saved) as TaskState[];
    return parsed.length === 5 ? parsed : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

function readSunlightMinutes() {
  if (typeof window === "undefined") {
    return 10;
  }

  const saved = Number(localStorage.getItem(SUNLIGHT_STORAGE_KEY));
  return Number.isFinite(saved) && saved >= 1 && saved <= 30 ? saved : 10;
}

function readGroundingAnswers() {
  if (typeof window === "undefined") {
    return DEFAULT_GROUNDING_ANSWERS;
  }

  try {
    const saved = localStorage.getItem(GROUNDING_STORAGE_KEY);
    if (!saved) {
      return DEFAULT_GROUNDING_ANSWERS;
    }

    return { ...DEFAULT_GROUNDING_ANSWERS, ...(JSON.parse(saved) as Partial<GroundingAnswers>) };
  } catch {
    return DEFAULT_GROUNDING_ANSWERS;
  }
}

function readActivities() {
  if (typeof window === "undefined") {
    return [] as ShelterActivity[];
  }

  try {
    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as ShelterActivity[]) : [];
  } catch {
    return [] as ShelterActivity[];
  }
}

function saveActivities(activities: ShelterActivity[]) {
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
}

export function EmotionalShelter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);
  const [careSection, setCareSection] = useState<CareSection>("water");
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingIndex, setBreathingIndex] = useState(0);
  const [waterState, setWaterState] = useState<WaterState>(() => readWaterState());
  const [sunlightMinutes, setSunlightMinutes] = useState(() => readSunlightMinutes());
  const [sunlightRemaining, setSunlightRemaining] = useState(() => readSunlightMinutes() * 60);
  const [sunlightRunning, setSunlightRunning] = useState(false);
  const [tasks, setTasks] = useState<TaskState[]>(() => readTasks());
  const [groundingAnswers, setGroundingAnswers] = useState<GroundingAnswers>(() => readGroundingAnswers());
  const [groundingSavedAt, setGroundingSavedAt] = useState("");
  const touchStartRef = useRef<number | null>(null);
  const touchCurrentRef = useRef<number | null>(null);
  const wheelLockRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const userId = user?.email || "guest";

  const breathingPhase = BREATHING_PHASES[breathingIndex];
  const waterGoal = WATER_GOALS[Math.min(waterState.goalIndex, WATER_GOALS.length - 1)];
  const waterProgress = Math.min(100, (waterState.amountMl / waterGoal) * 100);
  const activeTaskIndex = tasks.findIndex((task) => task.text.trim().length > 0 && !task.done);
  const activeTask = activeTaskIndex >= 0 ? tasks[activeTaskIndex] : null;
  const completedTasks = tasks.filter((task) => task.done).length;
  const translatedBreathingLabels = useTranslatedTexts(
    BREATHING_PHASES.map((phase) => phase.label)
  );
  const translatedBreathingAffirmations = useTranslatedTexts(
    BREATHING_PHASES.map((phase) => phase.affirmation)
  );
  const translatedGroundingPrompts = useTranslatedTexts(
    GROUNDING_PROMPTS.flatMap((prompt) => [prompt.question, prompt.placeholder])
  );
  const translatedSlideLabels = useTranslatedTexts([
    "Breathe",
    "Name things",
    "Reassurance",
    "Care",
    "Soft reminders",
  ]);
  const backLabel = useTranslatedText("Back");
  const stayWithMeLabel = useTranslatedText("Stay with me for 2 minutes");
  const swipeLabel = useTranslatedText("Swipe left or right");
  const noPressureLabel = useTranslatedText("No pressure. Just breathe with me.");
  const stayWithMeTitle = useTranslatedText("Stay with me for 2 minutes.");
  const stayWithMeDescription = useTranslatedText(
    "Start with one breath. Inhale, hold, exhale. The sound follows you on inhale and exhale, and the pause stays quiet."
  );
  const secondsLabel = useTranslatedText("seconds");
  const breathWithMe = useTranslatedText("Breath with me");
  const breathInstructions = useTranslatedText(
    "Inhale for 4. Hold for 4. Exhale for 4. The hold stays quiet so your body gets a real pause."
  );
  const restartBreathing = useTranslatedText("Restart breathing");
  const breatheWithMeButton = useTranslatedText("Breathe with me");
  const continueToNaming = useTranslatedText("Continue to naming things");
  const swipeHint = useTranslatedText("You can also swipe left or use your trackpad.");
  const namingThings = useTranslatedText("Naming things");
  const roomTitle = useTranslatedText("Come back to the room around you.");
  const roomDescription = useTranslatedText(
    "Write your answers right under each question. Save them when you are ready. They will appear in your profile under Activities."
  );
  const notSavedYet = useTranslatedText("Not saved yet");
  const previousLabel = useTranslatedText("Previous");
  const saveAnswers = useTranslatedText("Save answers");
  const nextLabel = useTranslatedText("Next");
  const reassuranceLabel = useTranslatedText("Reassurance");
  const reassuranceTitle = useTranslatedText("You do not have to carry everything at once.");
  const reassuranceTexts = useTranslatedTexts([
    "Hand on chest",
    "Put one hand on your chest and one on your stomach. Let your shoulders drop.",
    "Jaw soft",
    "Relax your tongue. Keep your teeth slightly apart. You do not need to brace right now.",
    "Gentle truth",
    "This feeling is real, but it is not permanent. You only need the next kind minute.",
    "Swipe left for care tools. Swipe right to return to naming things.",
    "Care tools",
  ]);
  const careLabel = useTranslatedText("Care");
  const careTitle = useTranslatedText("Choose one caring action.");
  const waterLabel = useTranslatedText("Water");
  const sunlightLabelText = useTranslatedText("Sunlight");
  const focusLabel = useTranslatedText("Focus");
  const goalLabel = useTranslatedText("Goal");
  const drinkWater = useTranslatedText("Drink water");
  const waterMessage = useTranslatedText(waterState.message);
  const add250 = useTranslatedText("+250 ml");
  const add500 = useTranslatedText("+500 ml");
  const startAgain = useTranslatedText("Start again");
  const waterTip = useTranslatedText(
    "First goal is 1 L. Then 2 L. Then 3.5 L. If the day slips away, hope stays and tomorrow starts gently again from 1 L."
  );
  const sunlightTitle = useTranslatedText("Sit near the sunlight");
  const sunlightDescription = useTranslatedText(
    "A little light still counts. Let it touch your face, your hands, or just the space beside you."
  );
  const sunlightDone = useTranslatedText("You made room for light today.");
  const sunlightTimerHelp = useTranslatedText("Set the timer between 1 and 30 minutes.");
  const chooseTimer = useTranslatedText("Choose your sunlight timer");
  const min1 = useTranslatedText("1 min");
  const min30 = useTranslatedText("30 min");
  const minSelected = useTranslatedText(`${sunlightMinutes} min selected`);
  const startTimer = useTranslatedText("Start timer");
  const resetLabel = useTranslatedText("Reset");
  const sunlightTip = useTranslatedText(
    "Even a short pause in daylight can tell your nervous system that the world is still here and you are still in it."
  );
  const priorityLabel = useTranslatedText("Priority");
  const currentTaskOnly = useTranslatedText("Current task only");
  const focusActiveDesc = useTranslatedText(
    "Everything else can wait. Finish this one, then the next priority can appear."
  );
  const markDone = useTranslatedText("Mark done");
  const addYourList = useTranslatedText(
    "Add your list. The top unfinished task becomes the only task that matters on this screen."
  );
  const focusSummary = useTranslatedText(
    completedTasks > 0
      ? `Well done. You completed ${completedTasks} ${completedTasks === 1 ? "task" : "tasks"}.`
      : "Do one thing before the next five things."
  );
  const resetList = useTranslatedText("Reset list");
  const careSwipeHint = useTranslatedText("Swipe right to go back. Swipe left for soft reminders.");
  const softReminders = useTranslatedText("Soft reminders");
  const softReminderTexts = useTranslatedTexts([
    "Loosen your forehead. Drop your shoulders. Uncurl your hands.",
    "Try one sip of water before deciding what comes next.",
    "If nothing else feels possible, stay with the breath: 4 in, 4 hold, 4 out.",
  ]);
  const affirmations = useTranslatedText("Affirmations");
  const affirmationTexts = useTranslatedTexts([
    "Do not feel down for needing care. Needing care is part of being human.",
    "You are allowed to rest before you know what to do next.",
    "This website can be a small home until your nervous system settles.",
  ]);
  const returnWhenReady = useTranslatedText("Return when you are ready");

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      audioContextRef.current?.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(waterState));
  }, [waterState]);

  useEffect(() => {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(SUNLIGHT_STORAGE_KEY, String(sunlightMinutes));
  }, [sunlightMinutes]);

  useEffect(() => {
    localStorage.setItem(GROUNDING_STORAGE_KEY, JSON.stringify(groundingAnswers));
  }, [groundingAnswers]);

  useEffect(() => {
    if (!breathingActive) {
      return;
    }

    if (breathingPhase.key === "inhale" || breathingPhase.key === "exhale") {
      playBreathSound(breathingPhase.key);
    }

    const timeoutId = window.setTimeout(() => {
      setBreathingIndex((current) => (current + 1) % BREATHING_PHASES.length);
    }, breathingPhase.seconds * 1000);

    return () => window.clearTimeout(timeoutId);
  }, [breathingActive, breathingIndex]);

  useEffect(() => {
    if (!sunlightRunning || sunlightRemaining <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSunlightRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setSunlightRunning(false);
          logActivity("Sunlight", "Finished sunlight pause", `${sunlightMinutes} minute sunlight session completed.`);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [sunlightMinutes, sunlightRemaining, sunlightRunning]);

  const sunlightLabel = useMemo(() => {
    const minutes = Math.floor(sunlightRemaining / 60);
    const seconds = sunlightRemaining % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [sunlightRemaining]);

  const logActivity = (category: string, title: string, detail: string) => {
    const nextActivity: ShelterActivity = {
      id: Date.now(),
      userId,
      category,
      title,
      detail,
      createdAt: new Date().toISOString(),
    };
    saveActivities([nextActivity, ...readActivities()]);
  };

  const ensureAudioContext = async () => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!audioContextRef.current) {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      audioContextRef.current = new AudioContextCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playBreathSound = async (kind: "inhale" | "exhale") => {
    const context = await ensureAudioContext();
    if (!context) {
      return;
    }

    const duration = kind === "inhale" ? 3.5 : 4.1;
    const bufferSize = context.sampleRate * duration;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < bufferSize; index += 1) {
      const progress = index / bufferSize;
      const breathCurve =
        kind === "inhale"
          ? Math.sin(progress * Math.PI * 0.9)
          : Math.sin(progress * Math.PI);
      const airyNoise = (Math.random() * 2 - 1) * 0.035;
      const softTone =
        Math.sin(2 * Math.PI * (kind === "inhale" ? 180 : 150) * index / context.sampleRate) * 0.012;
      data[index] = (airyNoise + softTone) * Math.max(breathCurve, 0);
    }

    const source = context.createBufferSource();
    source.buffer = buffer;

    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 120;

    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = kind === "inhale" ? 900 : 700;
    lowpass.Q.value = 0.4;

    const gain = context.createGain();
    const now = context.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(kind === "inhale" ? 0.028 : 0.022, now + duration * 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(context.destination);
    source.start(now);
    source.stop(now + duration);
  };

  const startBreathing = async () => {
    await ensureAudioContext();
    setBreathingIndex(0);
    setBreathingActive(true);
    logActivity("Breathing", "Started breathing with me", "Started 4-4-4 breathing on the shelter page.");
  };

  const goToPreviousSlide = () => {
    setSlideIndex((current) => Math.max(current - 1, 0));
  };

  const goToNextSlide = () => {
    setSlideIndex((current) => Math.min(current + 1, 4));
  };

  const handleTouchStart = (clientX: number) => {
    touchStartRef.current = clientX;
    touchCurrentRef.current = clientX;
  };

  const handleTouchMove = (clientX: number) => {
    if (touchStartRef.current === null) {
      return;
    }
    touchCurrentRef.current = clientX;
  };

  const handleTouchEnd = (clientX?: number) => {
    if (touchStartRef.current === null) {
      return;
    }

    const endX = clientX ?? touchCurrentRef.current ?? touchStartRef.current;
    const delta = touchStartRef.current - endX;
    if (Math.abs(delta) < 60) {
      touchStartRef.current = null;
      touchCurrentRef.current = null;
      return;
    }

    if (delta > 0) {
      goToNextSlide();
    } else {
      goToPreviousSlide();
    }

    touchStartRef.current = null;
    touchCurrentRef.current = null;
  };

  const handleWheel = (deltaX: number) => {
    if (Math.abs(deltaX) < 45 || wheelLockRef.current) {
      return;
    }

    wheelLockRef.current = true;
    if (deltaX > 0) {
      goToNextSlide();
    } else {
      goToPreviousSlide();
    }

    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 350);
  };

  const handleGroundingAnswer = (key: keyof GroundingAnswers, value: string) => {
    setGroundingAnswers((current) => ({ ...current, [key]: value }));
  };

  const saveGrounding = () => {
    const filledAnswers = GROUNDING_PROMPTS
      .map((prompt) => groundingAnswers[prompt.key].trim())
      .filter(Boolean);

    if (filledAnswers.length === 0) {
      return;
    }

    const savedAt = new Date().toLocaleString();
    setGroundingSavedAt(savedAt);
    logActivity(
      "Grounding",
      "Saved grounding answers",
      GROUNDING_PROMPTS.map((prompt) => `${prompt.question} ${groundingAnswers[prompt.key].trim()}`).join(" | "),
    );
  };

  const handleAddWater = (amountMl: number) => {
    setWaterState((current) => {
      const goalIndex = Math.min(current.goalIndex, WATER_GOALS.length - 1);
      const goal = WATER_GOALS[goalIndex];
      const nextAmount = current.amountMl + amountMl;

      if (nextAmount >= goal) {
        if (goalIndex < WATER_GOALS.length - 1) {
          const nextGoal = WATER_GOALS[goalIndex + 1];
          logActivity("Water", "Reached water goal", `Completed ${goal / 1000} L and moved to ${nextGoal / 1000} L.`);
          return {
            amountMl: 0,
            goalIndex: goalIndex + 1,
            message: `You reached ${goal / 1000} L. Breathe in that win. Next goal: ${nextGoal / 1000} L.`,
          };
        }

        logActivity("Water", "Reached final water goal", "Completed the 3.5 L water goal.");
        return {
          amountMl: WATER_GOALS[WATER_GOALS.length - 1],
          goalIndex,
          message: "You reached 3.5 L. Your body got real care today.",
        };
      }

      return {
        ...current,
        amountMl: nextAmount,
        message: `Water level rising. ${Math.max(goal - nextAmount, 0)} ml to go for today.`,
      };
    });
  };

  const handleResetWater = () => {
    setWaterState({
      amountMl: 0,
      goalIndex: 0,
      message: "That is okay. We start again gently with 1 L.",
    });
    logActivity("Water", "Restarted water habit", "Started water tracking again from 1 L.");
  };

  const handleSunlightMinutes = (value: number[]) => {
    const next = Math.min(30, Math.max(1, value[0] ?? 10));
    setSunlightMinutes(next);
    setSunlightRemaining(next * 60);
    setSunlightRunning(false);
  };

  const startSunlight = () => {
    setSunlightRemaining(sunlightMinutes * 60);
    setSunlightRunning(true);
    logActivity("Sunlight", "Started sunlight timer", `${sunlightMinutes} minute sunlight timer started.`);
  };

  const updateTask = (id: number, text: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, text, done: false } : task)),
    );
  };

  const completeTask = () => {
    if (!activeTask) {
      return;
    }

    setTasks((current) =>
      current.map((task) => (task.id === activeTask.id ? { ...task, done: true } : task)),
    );
    logActivity("Focus", "Completed focus task", activeTask.text);
  };

  const resetTasks = () => {
    setTasks(DEFAULT_TASKS);
    logActivity("Focus", "Reset focus list", "Cleared the current focus queue.");
  };

  const slideLabel = translatedSlideLabels[slideIndex] || ["Breathe", "Name things", "Reassurance", "Care", "Soft reminders"][slideIndex];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.18),_transparent_25%),linear-gradient(180deg,_#020617_0%,_#08112b_45%,_#172554_100%)] text-white">
      <div
        className="mx-auto flex min-h-screen max-w-5xl touch-pan-y flex-col px-4 py-4 md:px-6"
        onTouchStart={(event) => handleTouchStart(event.changedTouches[0]?.clientX ?? 0)}
        onTouchMove={(event) => handleTouchMove(event.changedTouches[0]?.clientX ?? 0)}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX)}
        onMouseDown={(event) => handleTouchStart(event.clientX)}
        onMouseMove={(event) => handleTouchMove(event.clientX)}
        onMouseUp={(event) => handleTouchEnd(event.clientX)}
        onMouseLeave={() => handleTouchEnd()}
        onWheel={(event) => handleWheel(event.deltaX)}
        style={{ touchAction: "pan-y" }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="rounded-full px-3 text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Button>
          <div className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-100">
            {stayWithMeLabel}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-slate-300">
          <span>{slideLabel}</span>
          <span>{swipeLabel}</span>
        </div>

        <div className="mb-5 flex items-center justify-center gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSlideIndex(index)}
              className={`h-2.5 rounded-full transition-all ${slideIndex === index ? "w-10 bg-rose-300" : "w-2.5 bg-white/25"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex flex-1 items-stretch justify-center pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, x: 70 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -70 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex w-full max-w-4xl flex-col"
            >
              {slideIndex === 0 && (
                <Card className="flex flex-col justify-between rounded-[2rem] border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
                  <div>
                    <div className="flex items-center gap-2 text-rose-300">
                      <Heart className="size-5 fill-current" />
                      <span className="text-sm font-medium">{noPressureLabel}</span>
                    </div>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight">{stayWithMeTitle}</h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                      {stayWithMeDescription}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center">
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ scale: breathingActive ? (breathingPhase.key === "inhale" ? 1.1 : breathingPhase.key === "hold" ? 1.18 : 0.92) : 1 }}
                        transition={{ duration: breathingPhase.seconds, ease: "easeInOut" }}
                        className="flex size-72 flex-col items-center justify-center rounded-full bg-gradient-to-br from-rose-300 via-amber-200 to-sky-300 text-slate-950 shadow-[0_20px_70px_rgba(251,113,133,0.35)]"
                      >
                        <p className="text-lg font-medium uppercase tracking-[0.3em]">{translatedBreathingLabels[breathingIndex] || breathingPhase.label}</p>
                        <p className="mt-2 text-5xl font-semibold">{breathingPhase.seconds}</p>
                        <p className="mt-2 text-base">{secondsLabel}</p>
                      </motion.div>
                    </div>

                    <div className="w-full max-w-2xl space-y-4">
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-sky-200">
                          <Waves className="size-4" />
                          {breathWithMe}
                        </div>
                        <p className="mt-3 text-2xl font-semibold">{translatedBreathingAffirmations[breathingIndex] || breathingPhase.affirmation}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {breathInstructions}
                        </p>
                      </div>
                      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <Button
                          className="min-w-56 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100"
                          onClick={startBreathing}
                        >
                          <Play className="size-4" />
                          {breathingActive ? restartBreathing : breatheWithMeButton}
                        </Button>
                        <button
                          type="button"
                          onClick={goToNextSlide}
                          className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
                        >
                          {continueToNaming}
                          <ArrowRight className="size-4" />
                        </button>
                        <p className="text-center text-xs text-slate-400">
                          {swipeHint}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {slideIndex === 1 && (
                <Card className="flex flex-col rounded-[2rem] border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
                  <div>
                    <div className="flex items-center gap-2 text-amber-200">
                      <Sparkles className="size-5" />
                      <span className="text-sm font-medium">{namingThings}</span>
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold">{roomTitle}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                      {roomDescription}
                    </p>
                  </div>

                  <div className="mt-5 grid flex-1 gap-3 md:grid-cols-2">
                    {GROUNDING_PROMPTS.map((prompt, index) => (
                      <div key={prompt.key} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-medium text-rose-100">{translatedGroundingPrompts[index * 2] || prompt.question}</p>
                        <Textarea
                          value={groundingAnswers[prompt.key]}
                          onChange={(event) => handleGroundingAnswer(prompt.key, event.target.value)}
                          placeholder={translatedGroundingPrompts[index * 2 + 1] || prompt.placeholder}
                          className="mt-3 min-h-24 border-white/10 bg-white/10 text-white placeholder:text-slate-400"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-emerald-200">{groundingSavedAt ? `Saved ${groundingSavedAt}` : notSavedYet}</div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                        onClick={() => setSlideIndex(0)}
                      >
                        <ChevronLeft className="size-4" />
                        {previousLabel}
                      </Button>
                      <Button className="rounded-full bg-emerald-300 text-slate-950 hover:bg-emerald-200" onClick={saveGrounding}>
                        {saveAnswers}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                        onClick={() => setSlideIndex(2)}
                      >
                        {nextLabel}
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {slideIndex === 2 && (
                <Card className="flex flex-col justify-between rounded-[2rem] border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
                  <div>
                    <div className="flex items-center gap-2 text-rose-300">
                      <Heart className="size-5 fill-current" />
                      <span className="text-sm font-medium">{reassuranceLabel}</span>
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold">{reassuranceTitle}</h2>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-rose-100">{reassuranceTexts[0]}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {reassuranceTexts[1]}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-rose-100">{reassuranceTexts[2]}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {reassuranceTexts[3]}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-rose-100">{reassuranceTexts[4]}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {reassuranceTexts[5]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="max-w-xl text-sm text-slate-300">
                      {reassuranceTexts[6]}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                        onClick={() => setSlideIndex(1)}
                      >
                        <ChevronLeft className="size-4" />
                        {previousLabel}
                      </Button>
                      <Button className="rounded-full bg-white text-slate-950 hover:bg-slate-100" onClick={() => setSlideIndex(3)}>
                        {reassuranceTexts[7]}
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {slideIndex === 3 && (
                <Card className="flex flex-col rounded-[2rem] border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sky-200">
                        <Sparkles className="size-5" />
                        <span className="text-sm font-medium">{careLabel}</span>
                      </div>
                      <h2 className="mt-3 text-3xl font-semibold">{careTitle}</h2>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row">
                      <Button
                        variant={careSection === "water" ? "secondary" : "outline"}
                        className="rounded-full"
                        onClick={() => setCareSection("water")}
                      >
                        {waterLabel}
                      </Button>
                      <Button
                        variant={careSection === "sunlight" ? "secondary" : "outline"}
                        className="rounded-full"
                        onClick={() => setCareSection("sunlight")}
                      >
                        {sunlightLabelText}
                      </Button>
                      <Button
                        variant={careSection === "focus" ? "secondary" : "outline"}
                        className="rounded-full"
                        onClick={() => setCareSection("focus")}
                      >
                        {focusLabel}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 flex-1">
                    {careSection === "water" && (
                      <div className="grid h-full gap-4 md:grid-cols-[0.9fr_1.1fr]">
                        <div className="flex items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                          <div className="relative flex h-80 w-36 items-end overflow-hidden rounded-[2rem] border-4 border-sky-200/80 bg-slate-950/40">
                            <motion.div
                              animate={{ height: `${waterProgress}%` }}
                              className="absolute inset-x-0 bottom-0 rounded-b-[1.6rem] bg-gradient-to-t from-sky-500 via-cyan-400 to-sky-200"
                            />
                            <div className="relative z-10 flex w-full flex-col items-center gap-2 pb-4">
                              <Droplets className="size-8 text-sky-100" />
                              <span className="text-lg font-medium">{Math.round(waterState.amountMl / 100) / 10} L</span>
                              <span className="text-xs text-slate-200">{goalLabel} {waterGoal / 1000} L</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4">
                          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                            <p className="text-2xl font-semibold">{drinkWater}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{waterMessage}</p>
                            <div className="mt-5 flex flex-wrap gap-3">
                              <Button className="rounded-full bg-sky-300 text-slate-950 hover:bg-sky-200" onClick={() => handleAddWater(250)}>
                                {add250}
                              </Button>
                              <Button className="rounded-full bg-sky-500 text-white hover:bg-sky-400" onClick={() => handleAddWater(500)}>
                                {add500}
                              </Button>
                              <Button variant="outline" className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10" onClick={handleResetWater}>
                                {startAgain}
                              </Button>
                            </div>
                          </div>
                          <div className="rounded-[1.75rem] border border-emerald-300/20 bg-emerald-300/10 p-5 text-sm leading-6 text-emerald-50">
                            {waterTip}
                          </div>
                        </div>
                      </div>
                    )}

                    {careSection === "sunlight" && (
                      <div className="grid h-full gap-4 md:grid-cols-[1fr_1fr]">
                        <div className="rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-5">
                          <div className="flex items-center gap-2 text-amber-100">
                            <Sunrise className="size-5" />
                            <span className="text-sm font-medium">{sunlightTitle}</span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-amber-50/90">
                            {sunlightDescription}
                          </p>
                          <p className="mt-5 text-5xl font-semibold tracking-[0.22em]">{sunlightLabel}</p>
                          <p className="mt-2 text-sm text-amber-50/80">
                            {sunlightRemaining === 0 ? sunlightDone : sunlightTimerHelp}
                          </p>
                        </div>
                        <div className="grid gap-4">
                          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                            <p className="text-sm font-medium text-slate-200">{chooseTimer}</p>
                            <div className="mt-5 px-2">
                              <Slider value={[sunlightMinutes]} min={1} max={30} step={1} onValueChange={handleSunlightMinutes} />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                              <span>{min1}</span>
                              <span>{minSelected}</span>
                              <span>{min30}</span>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                              <Button className="rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200" onClick={startSunlight}>
                                <Play className="size-4" />
                                {startTimer}
                              </Button>
                              <Button
                                variant="outline"
                                className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                                onClick={() => {
                                  setSunlightRunning(false);
                                  setSunlightRemaining(sunlightMinutes * 60);
                                }}
                              >
                                <TimerReset className="size-4" />
                                {resetLabel}
                              </Button>
                            </div>
                          </div>
                          <div className="rounded-[1.75rem] border border-rose-300/20 bg-rose-300/10 p-5 text-sm leading-6 text-rose-50">
                            {sunlightTip}
                          </div>
                        </div>
                      </div>
                    )}

                    {careSection === "focus" && (
                      <div className="grid h-full gap-4 md:grid-cols-[1fr_1fr]">
                        <div className="grid gap-3">
                          {tasks.map((task, index) => (
                            <div key={task.id} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">
                                {priorityLabel} {index + 1}
                              </label>
                              <Input
                                value={task.text}
                                onChange={(event) => updateTask(task.id, event.target.value)}
                                placeholder={`Important thing ${index + 1}`}
                                className="border-white/10 bg-white/10 text-white placeholder:text-slate-400"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="grid gap-4">
                          <div className="rounded-[1.75rem] border border-emerald-300/20 bg-emerald-300/10 p-5">
                            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-50/80">{currentTaskOnly}</p>
                            {activeTask ? (
                              <>
                                <p className="mt-3 text-2xl font-semibold">{activeTask.text}</p>
                                <p className="mt-3 text-sm leading-6 text-emerald-50/85">
                                  {focusActiveDesc}
                                </p>
                                <Button className="mt-5 rounded-full bg-white text-slate-950 hover:bg-slate-100" onClick={completeTask}>
                                  <CheckCircle2 className="size-4" />
                                  {markDone}
                                </Button>
                              </>
                            ) : (
                              <p className="mt-3 text-sm leading-6 text-emerald-50/85">
                                {addYourList}
                              </p>
                            )}
                          </div>
                          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                            <p className="text-sm leading-6 text-slate-300">
                              {focusSummary}
                            </p>
                            <Button variant="outline" className="mt-4 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10" onClick={resetTasks}>
                              {resetList}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-300">{careSwipeHint}</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                        onClick={() => setSlideIndex(2)}
                      >
                        <ChevronLeft className="size-4" />
                        {previousLabel}
                      </Button>
                      <Button className="rounded-full bg-white text-slate-950 hover:bg-slate-100" onClick={() => setSlideIndex(4)}>
                        {nextLabel}
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {slideIndex === 4 && (
                <Card className="flex flex-col justify-between rounded-[2rem] border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl">
                  <div className="grid flex-1 gap-4 md:grid-cols-2">
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                      <p className="text-xs uppercase tracking-[0.32em] text-slate-400">{softReminders}</p>
                      <div className="mt-4 space-y-4 text-lg leading-8 text-slate-100">
                        <p>{softReminderTexts[0]}</p>
                        <p>{softReminderTexts[1]}</p>
                        <p>{softReminderTexts[2]}</p>
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] border border-rose-300/20 bg-rose-300/10 p-5">
                      <p className="text-xs uppercase tracking-[0.32em] text-rose-100/70">{affirmations}</p>
                      <div className="mt-4 space-y-4 text-lg leading-8 text-white">
                        <p>{affirmationTexts[0]}</p>
                        <p>{affirmationTexts[1]}</p>
                        <p>{affirmationTexts[2]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={() => setSlideIndex(3)}
                    >
                      <ChevronLeft className="size-4" />
                      {previousLabel}
                    </Button>
                    <Button className="rounded-full bg-white px-8 text-slate-950 hover:bg-slate-100" onClick={() => navigate("/")}>
                      {returnWhenReady}
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
