import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { Smile, Meh, Frown, Angry, Heart, CalendarDays, Sparkles } from "lucide-react";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
import { Textarea } from "./UI/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

interface MoodEntry {
  id: number;
  mood: string;
  note?: string;
  createdAt: string;
  userId: string;
}

const moods = [
  { value: "great", icon: Heart, color: "text-pink-500", bg: "bg-pink-100", ring: "ring-pink-300", labelKey: "moodGreat" },
  { value: "good", icon: Smile, color: "text-green-500", bg: "bg-green-100", ring: "ring-green-300", labelKey: "moodGood" },
  { value: "okay", icon: Meh, color: "text-yellow-500", bg: "bg-yellow-100", ring: "ring-yellow-300", labelKey: "moodOkay" },
  { value: "bad", icon: Frown, color: "text-orange-500", bg: "bg-orange-100", ring: "ring-orange-300", labelKey: "moodBad" },
  { value: "terrible", icon: Angry, color: "text-red-500", bg: "bg-red-100", ring: "ring-red-300", labelKey: "moodTerrible" },
];

const moodScoreMap: Record<string, number> = {
  terrible: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
};

function getAverageMoodScore(entries: MoodEntry[]) {
  if (entries.length === 0) {
    return null;
  }

  const total = entries.reduce((sum, entry) => sum + (moodScoreMap[entry.mood] || 3), 0);
  return total / entries.length;
}

function getLowMoodStreak(entries: MoodEntry[]) {
  let streak = 0;

  for (const entry of entries) {
    if (entry.mood === "bad" || entry.mood === "terrible") {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function getMoodPattern(entries: MoodEntry[]) {
  const recentEntries = entries.slice(0, 7);
  const counts = recentEntries.reduce<Record<string, number>>((accumulator, entry) => {
    accumulator[entry.mood] = (accumulator[entry.mood] || 0) + 1;
    return accumulator;
  }, {});

  const dominantMoodValue =
    Object.entries(counts).sort((first, second) => second[1] - first[1])[0]?.[0] || null;
  const lowMoodStreak = getLowMoodStreak(entries);
  const recentWindow = recentEntries.slice(0, 3);
  const previousWindow = recentEntries.slice(3, 6);
  const recentAverage = getAverageMoodScore(recentWindow);
  const previousAverage = getAverageMoodScore(previousWindow);
  const moodSwings = recentEntries.reduce((count, entry, index, allEntries) => {
    if (index === 0) {
      return count;
    }

    return allEntries[index - 1].mood !== entry.mood ? count + 1 : count;
  }, 0);

  let trend: "up" | "down" | "steady" = "steady";
  if (recentAverage !== null && previousAverage !== null) {
    if (recentAverage - previousAverage >= 0.5) {
      trend = "up";
    } else if (previousAverage - recentAverage >= 0.5) {
      trend = "down";
    }
  }

  let summaryKey = "moodPatternNeutral";
  let suggestionKey = "moodPatternNeutralHelp";

  if (lowMoodStreak >= 3) {
    summaryKey = "moodPatternLowStreak";
    suggestionKey = "moodPatternLowStreakHelp";
  } else if (trend === "up") {
    summaryKey = "moodPatternImproving";
    suggestionKey = "moodPatternImprovingHelp";
  } else if (trend === "down") {
    summaryKey = "moodPatternTougher";
    suggestionKey = "moodPatternTougherHelp";
  } else if (moodSwings >= 4) {
    summaryKey = "moodPatternMixed";
    suggestionKey = "moodPatternMixedHelp";
  }

  const recentNotes = recentEntries.filter((entry) => entry.note?.trim());
  const lowMoodWithNotes = recentEntries.filter(
    (entry) => (entry.mood === "bad" || entry.mood === "terrible") && entry.note?.trim()
  ).length;
  const noteInsightKey =
    recentNotes.length === 0
      ? "moodPatternNoteInsightNone"
      : lowMoodWithNotes >= 2
        ? "moodPatternNoteInsightPresent"
        : "moodPatternNoteInsightGeneral";

  const careKey =
    lowMoodStreak >= 3
      ? "moodPatternCareUrgent"
      : trend === "down"
        ? "moodPatternCareGentle"
        : trend === "up"
          ? "moodPatternCareKeep"
          : "moodPatternCareSteady";

  return {
    dominantMoodValue,
    lowMoodStreak,
    summaryKey,
    suggestionKey,
    noteInsightKey,
    careKey,
  };
}

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      const allEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]") as MoodEntry[];
      const userEntries = allEntries.filter((entry) => entry.userId === user.email);
      setEntries(
        [...userEntries].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    }
  }, [user]);

  const handleSaveMood = () => {
    if (!selectedMood) {
      toast.error(t("pleaseSelectMood"));
      return;
    }

    const entry: MoodEntry = {
      id: Date.now(),
      mood: selectedMood,
      note: note.trim(),
      createdAt: new Date().toISOString(),
      userId: user!.email,
    };

    const allEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    allEntries.push(entry);
    localStorage.setItem("moodEntries", JSON.stringify(allEntries));

    setEntries([entry, ...entries]);
    setSelectedMood("");
    setNote("");
    toast.success(t("moodTracked"));
  };

  const getMoodIcon = (moodValue: string) => moods.find((mood) => mood.value === moodValue) || moods[2];

  const latestEntry = entries[0];
  const lastSevenEntries = entries.slice(0, 7);
  const noteCount = entries.filter((entry) => entry.note?.trim()).length;
  const moodPattern = getMoodPattern(entries);
  const latestMood = latestEntry ? getMoodIcon(latestEntry.mood) : null;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">{t("moodTitle")}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t("homeMoodDesc")}</p>
      </motion.div>

      <div className="space-y-8">
        <Card className="self-start p-6 bg-white/75 backdrop-blur-md dark:bg-slate-900/55">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-pink-500" />
            <h3 className="text-xl">{t("moodCheckInTitle")}</h3>
          </div>
          <p className="mb-4 text-sm text-gray-600 dark:text-slate-300">{t("moodCheckInSubtitle")}</p>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
            {moods.map((mood, index) => {
              const Icon = mood.icon;
              return (
                <motion.div
                  key={mood.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    className={`w-full rounded-[1.25rem] px-3 py-4 flex min-h-28 flex-col items-center justify-center gap-2 border transition-all ${
                      selectedMood === mood.value
                        ? `${mood.bg} ring-4 ring-offset-2 ${mood.ring} border-transparent`
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className={`size-11 ${selectedMood === mood.value ? mood.color : "text-gray-400"}`} />
                    <span className={`text-sm ${selectedMood === mood.value ? mood.color : "text-gray-600 dark:text-slate-300"}`}>
                      {t(mood.labelKey)}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5 mb-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("moodCheckInPlaceholder")}
              className="min-h-24 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60"
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Button onClick={handleSaveMood} className="w-full rounded-full md:w-auto" size="lg">
              {t("saveMood")}
            </Button>
            {latestMood && latestEntry && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 md:justify-end">
                <latestMood.icon className={`size-4 ${latestMood.color}`} />
                <span>
                  {t("moodLastCheckIn").replace("{mood}", t(latestMood.labelKey)).replace(
                    "{date}",
                    format(new Date(latestEntry.createdAt), "MMM d")
                  )}
                </span>
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="p-6 bg-gradient-to-br from-pink-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="size-5 text-sky-500" />
              <h3 className="text-xl">Mood snapshot</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Latest</p>
                <p className="mt-2 font-medium">
                  {latestEntry ? t(getMoodIcon(latestEntry.mood).labelKey) : "No check-in yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Entries</p>
                <p className="mt-2 font-medium">{entries.length}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-sm font-medium">{t("moodPatternsRecentTitle")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lastSevenEntries.length === 0 && (
                  <p className="text-sm text-gray-600 dark:text-slate-300">Your recent moods will show up here.</p>
                )}
                {lastSevenEntries.map((entry) => {
                  const mood = getMoodIcon(entry.mood);
                  const Icon = mood.icon;
                  return (
                    <div key={entry.id} className={`flex items-center gap-2 rounded-full px-3 py-2 ${mood.bg}`}>
                      <Icon className={`size-4 ${mood.color}`} />
                      <span className="text-sm text-slate-800">{format(new Date(entry.createdAt), "MMM d")}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">
                {t("moodSnapshotNotesCount").replace("{count}", String(noteCount))}
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden bg-white/75 backdrop-blur-md dark:bg-slate-900/55">
            <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 p-6 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-5 text-rose-500" />
                <h3 className="text-xl">{t("moodPatternsTitle")}</h3>
              </div>
              <p className="text-sm leading-6 text-gray-600 dark:text-slate-300">
                {t("moodPatternsDisclaimer")}
              </p>
            </div>

            {entries.length === 0 ? (
              <div className="p-6">
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-gray-600 dark:border-slate-700 dark:text-slate-300">
                  {t("moodPatternsEmpty")}
                </div>
              </div>
            ) : (
              <div className="p-6 pt-4">
                <div className="rounded-[1.75rem] border border-rose-100 bg-rose-50/80 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
                  <p className="text-xs uppercase tracking-[0.24em] text-rose-500 dark:text-rose-300">{t("moodPatternsHumanTitle")}</p>
                  <p className="mt-3 text-xl leading-8 text-slate-900 dark:text-white">{t(moodPattern.summaryKey)}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{t(moodPattern.suggestionKey)}</p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
                    <p className="text-sm font-medium dark:text-white">{t("moodPatternsReflectionLead")}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
                      {moodPattern.dominantMoodValue
                        ? t("moodPatternDominantReflection").replace(
                            "{mood}",
                            t(getMoodIcon(moodPattern.dominantMoodValue).labelKey)
                          )
                        : t("moodPatternsNotEnoughData")}
                    </p>
                  </div>

                  <div className="border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
                    <p className="text-sm font-medium dark:text-white">{t("moodPatternsNotesLead")}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">{t(moodPattern.noteInsightKey)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium dark:text-white">{t("moodPatternsCareLead")}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">{t(moodPattern.careKey)}</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {moodPattern.lowMoodStreak > 0
                        ? t("moodPatternsLowStreakValue").replace("{count}", String(moodPattern.lowMoodStreak))
                        : t("moodPatternsNoLowStreak")}
                    </p>
                  </div>
                </div>

                {moodPattern.lowMoodStreak >= 3 && (
                  <div className="mt-5">
                    <Button variant="outline" className="w-full rounded-full" onClick={() => navigate("/shelter")}>
                      {t("moodPatternsSupportCta")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl mb-4">{t("yourMoodHistory")}</h3>
        {entries.length === 0 ? (
          <Card className="p-12 text-center text-gray-400">
            <p>{t("noMoodEntriesYet")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const mood = getMoodIcon(entry.mood);
              const Icon = mood.icon;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${mood.bg}`}>
                        <Icon className={`size-6 ${mood.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-medium ${mood.color}`}>{t(mood.labelKey)}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(entry.createdAt), "PPP 'at' p")}
                          </span>
                        </div>
                        {entry.note && <p className="text-sm text-gray-600 dark:text-slate-300">{entry.note}</p>}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
