import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Lock, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "./UI/button";
import { Textarea } from "./UI/textarea";
import { Card } from "./UI/card";
import { Input } from "./UI/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./UI/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./UI/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { recoveryQuestions } from "../data/mental-health";

interface JournalEntry {
  id: number;
  text: string;
  createdAt: string;
  userId: string;
}

export function Journal() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [setupPinConfirm, setSetupPinConfirm] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState(recoveryQuestions[0]);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [showSharedPinNotice, setShowSharedPinNotice] = useState(false);
  const [resetPin, setResetPin] = useState("");
  const [resetPinConfirm, setResetPinConfirm] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [showCrisisResources, setShowCrisisResources] = useState(false);

  const {
    user,
    isAuthenticated,
    hasPrivateAccessConfigured,
    setupPrivateAccess,
    verifyPrivatePin,
    verifyPinRecoveryAnswer,
    resetPrivatePin,
  } = useAuth();
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

  useEffect(() => {
    if (!user?.email || !hasPrivateAccessConfigured) {
      return;
    }
    const noticeKey = `shared_pin_notice_journal_${user.email}`;
    const seen = localStorage.getItem(noticeKey);
    if (!seen) {
      setShowSharedPinNotice(true);
    }
  }, [user?.email, hasPrivateAccessConfigured]);

  const handleInitialPrivateAccessSetup = async () => {
    if (setupPin.length !== 4 || setupPinConfirm.length !== 4) {
      toast.error("PIN must be 4 digits.");
      return;
    }

    if (setupPin !== setupPinConfirm) {
      toast.error("PINs do not match.");
      return;
    }

    if (!recoveryQuestion.trim() || !recoveryAnswer.trim()) {
      toast.error("Please set one recovery question and answer.");
      return;
    }

    await setupPrivateAccess(setupPin, recoveryQuestion, recoveryAnswer);
    toast.success("Private access setup complete.");
    setPin("");
    setIsUnlocked(true);
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      toast.error(t("pinMustBe4Digits"));
      return;
    }

    const ok = await verifyPrivatePin(pin);
    if (ok) {
      setIsUnlocked(true);
      setFailedAttempts(0);
    } else {
      toast.error(t("incorrectPin"));
      setPin("");
      setFailedAttempts((count) => count + 1);
    }
  };

  const handlePinReset = async () => {
    if (!user?.pinRecoveryQuestion) {
      toast.error("Recovery question not available.");
      return;
    }

    if (resetPin.length !== 4 || resetPinConfirm.length !== 4) {
      toast.error("PIN must be 4 digits.");
      return;
    }

    if (resetPin !== resetPinConfirm) {
      toast.error("PINs do not match.");
      return;
    }

    const validAnswer = await verifyPinRecoveryAnswer(recoveryAnswer);
    if (!validAnswer) {
      toast.error("Recovery answer does not match.");
      return;
    }

    await resetPrivatePin(resetPin);
    toast.success("PIN reset successful. Use your new PIN to continue.");
    setShowForgotPin(false);
    setRecoveryAnswer("");
    setResetPin("");
    setResetPinConfirm("");
    setPin("");
    setFailedAttempts(0);
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
    const showSetup = !hasPrivateAccessConfigured;

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
            <h3 className="text-xl mb-2">{showSetup ? "Set Up Your Private Access" : t("enterPin")}</h3>
            <p className="text-sm text-gray-600">
              {showSetup
                ? "Set one PIN for both Journal and Confession Box, plus a recovery question."
                : "Enter your shared private PIN to unlock your journal."}
            </p>
          </div>

          {showSetup ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Choose 4-digit PIN</p>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={setupPin} onChange={setSetupPin}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Confirm PIN</p>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={setupPinConfirm} onChange={setSetupPinConfirm}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Choose recovery question</p>
                <Select value={recoveryQuestion} onValueChange={setRecoveryQuestion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recoveryQuestions.map((question) => (
                      <SelectItem key={question} value={question}>
                        {question}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Recovery answer"
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
              />
              <Button onClick={handleInitialPrivateAccessSetup} className="w-full">
                Save and Unlock
              </Button>
            </div>
          ) : showForgotPin ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Recovery Question:</span>{" "}
                {user?.pinRecoveryQuestion}
              </p>
              <Input
                placeholder="Your recovery answer"
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
              />

              <div>
                <p className="text-sm text-gray-600 mb-2">New 4-digit PIN</p>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={resetPin} onChange={setResetPin}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Confirm new PIN</p>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={resetPinConfirm} onChange={setResetPinConfirm}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button onClick={handlePinReset} className="w-full">
                Reset PIN
              </Button>
              <Button variant="outline" onClick={() => setShowForgotPin(false)} className="w-full">
                Back to PIN
              </Button>
            </div>
          ) : (
            <>
              {showSharedPinNotice && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <p>
                    The PIN for Journal and Confession is the same. You do not need to create a second PIN.
                  </p>
                  <Button
                    variant="ghost"
                    className="h-auto px-0 py-1 text-blue-700"
                    onClick={() => {
                      if (user?.email) {
                        localStorage.setItem(`shared_pin_notice_journal_${user.email}`, "1");
                      }
                      setShowSharedPinNotice(false);
                    }}
                  >
                    Got it
                  </Button>
                </div>
              )}
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
              {failedAttempts > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowForgotPin(true)}
                  className="w-full mt-3"
                >
                  Forgot PIN?
                </Button>
              )}
            </>
          )}
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
