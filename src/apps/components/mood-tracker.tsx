import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { Smile, Meh, Frown, Angry, Heart } from "lucide-react";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
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
  { value: "great", icon: Heart, color: "text-pink-500", bg: "bg-pink-100", labelKey: "moodGreat" },
  { value: "good", icon: Smile, color: "text-green-500", bg: "bg-green-100", labelKey: "moodGood" },
  { value: "okay", icon: Meh, color: "text-yellow-500", bg: "bg-yellow-100", labelKey: "moodOkay" },
  { value: "bad", icon: Frown, color: "text-orange-500", bg: "bg-orange-100", labelKey: "moodBad" },
  { value: "terrible", icon: Angry, color: "text-red-500", bg: "bg-red-100", labelKey: "moodTerrible" },
];

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
      const allEntries = JSON.parse(
        localStorage.getItem("moodEntries") || "[]",
      ) as MoodEntry[];
      const userEntries = allEntries.filter((e) => e.userId === user.email);
      setEntries([...userEntries].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
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

  const getMoodIcon = (moodValue: string) => {
    const mood = moods.find((m) => m.value === moodValue);
    return mood || moods[2];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">{t("moodTitle")}</h1>
        <p className="text-gray-600">{t("homeMoodDesc")}</p>
      </motion.div>

      {/* Mood Selection */}
      <Card className="p-8 mb-8">
        <h3 className="text-xl mb-6 text-center">{t("selectYourMood")}</h3>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {moods.map((mood, index) => {
            const Icon = mood.icon;
            return (
              <motion.div
                key={mood.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setSelectedMood(mood.value)}
                  className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedMood === mood.value
                      ? `${mood.bg} ring-4 ring-offset-2 ring-${mood.color.replace('text-', '')}`
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Icon className={`size-12 ${selectedMood === mood.value ? mood.color : "text-gray-400"}`} />
                  <span className={`text-sm ${selectedMood === mood.value ? mood.color : "text-gray-600"}`}>
                    {t(mood.labelKey)}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-2">{t("addNoteOptional")}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("whatsOnYourMind")}
            className="w-full p-3 border rounded-lg resize-none h-24"
          />
        </div>

        <Button onClick={handleSaveMood} className="w-full">
          {t("saveMood")}
        </Button>
      </Card>

      {/* Mood History */}
      <div>
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
                        {entry.note && (
                          <p className="text-sm text-gray-600">{entry.note}</p>
                        )}
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
