import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Lock, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "./UI/button";
import { Textarea } from "./UI/textarea";
import { Card } from "./UI/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./UI/input-otp";
import { toast } from "sonner";
import { format } from "date-fns";

interface JournalEntry {
  id: number;
  text: string;
  createdAt: string;
  userId: string;
}

export function Journal() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [showCrisisResources, setShowCrisisResources] = useState(false);

  const { user, isAuthenticated, setJournalPin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isUnlocked && user) {
      // Load journal entries
      const allEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      const userEntries = allEntries.filter((e: JournalEntry) => e.userId === user.email);
      setEntries(userEntries);
    }
  }, [isUnlocked, user]);

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      toast.error(t("pinMustBe4Digits"));
      return;
    }

    if (!user?.journalPin) {
      // First time - set the PIN
      setJournalPin(pin);
      toast.success(t("journalPinSetSuccess"));
      setIsUnlocked(true);
    } else if (pin === user.journalPin) {
      setIsUnlocked(true);
    } else {
      toast.error(t("incorrectPin"));
      setPin("");
    }
  };

  const checkForCrisisWords = (text: string) => {
    const crisisKeywords = [
      "self-harm",
      "self harm",
      "kill myself",
      "suicide",
      "end my life",
      "want to die",
      "hurt myself",
    ];

    const lowerText = text.toLowerCase();
    return crisisKeywords.some((keyword) => lowerText.includes(keyword));
  };

  const handleAddEntry = () => {
    if (!newEntry.trim()) {
      toast.error(t("pleaseWriteSomething"));
      return;
    }

    // Check for crisis keywords
    if (checkForCrisisWords(newEntry)) {
      setShowCrisisResources(true);
      return;
    }

    const entry: JournalEntry = {
      id: Date.now(),
      text: newEntry,
      createdAt: new Date().toISOString(),
      userId: user!.email,
    };

    const allEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    allEntries.push(entry);
    localStorage.setItem("journalEntries", JSON.stringify(allEntries));

    setEntries([entry, ...entries]);
    setNewEntry("");
    toast.success(t("entrySaved"));
  };

  const handleDeleteEntry = (id: number) => {
    const allEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    const updatedEntries = allEntries.filter((e: JournalEntry) => e.id !== id);
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
    setEntries(entries.filter((e) => e.id !== id));
    toast.success(t("entryDeleted"));
  };

  if (showCrisisResources) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <AlertCircle className="size-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl mb-4">{t("crisisMessage")}</h2>
            <p className="text-gray-700 mb-6">{t("youAreNotAloneReachOut")}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate("/emergency")}
                className="bg-red-500 hover:bg-red-600"
              >
                {t("viewEmergencyResources")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCrisisResources(false)}
              >
                {t("goBack")}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl mb-3">{t("journalTitle")}</h1>
          <p className="text-gray-600">{t("journalPrivateSecureSpace")}</p>
        </motion.div>

        <Card className="p-8">
          <div className="text-center mb-6">
            <Lock className="size-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl mb-2">{t("enterPin")}</h3>
            <p className="text-sm text-gray-600">
              {user?.journalPin
                  ? t("enterPinToAccessJournal")
                  : t("setPinToProtectJournal")}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <InputOTP maxLength={4} value={pin} onChange={setPin}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button onClick={handlePinSubmit} className="w-full">
            {t("unlock")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl mb-2">{t("journalTitle")}</h1>
            <p className="text-gray-600">{t("journalSanctuary")}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsUnlocked(false);
              setPin("");
            }}
          >
            <Lock className="size-4 mr-2" />
            {t("lock")}
          </Button>
        </div>
      </motion.div>

      {/* New Entry */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="size-5 text-blue-500" />
            <h3 className="text-lg">{t("newEntry")}</h3>
          </div>
          <Textarea
            placeholder={t("writeThoughtsHere")}
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-32 mb-4"
          />
          <Button onClick={handleAddEntry}>
            <Plus className="size-4 mr-2" />
            {t("addEntry")}
          </Button>
        </Card>
      </motion.div>

      {/* Entries List */}
      <div className="space-y-4">
        <AnimatePresence>
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              <BookOpen className="size-16 mx-auto mb-4" />
              <p>{t("noEntriesYetStartWriting")}</p>
            </motion.div>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-gray-500">
                      {format(new Date(entry.createdAt), "PPP 'at' p")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{entry.text}</p>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
