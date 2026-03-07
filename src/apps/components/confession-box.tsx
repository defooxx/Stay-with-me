import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, Lock, AlertCircle } from "lucide-react";
import { Button } from "./UI/button";
import { Textarea } from "./UI/textarea";
import { Card } from "./UI/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./UI/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./UI/select";
import { toast } from "sonner";

export function ConfessionBox() {
  const [step, setStep] = useState<"pin" | "mode" | "confess" | "response">("pin");
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"ai" | "noai">("ai");
  const [confession, setConfession] = useState("");
  const [deleteOption, setDeleteOption] = useState("now");
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const { user, isAuthenticated, setConfessionPin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const videos = [
    "1P3ZgLOy-w8",
    "nS8Lim2OlK0",
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check if user has already set a confession PIN
    if (user?.confessionPin) {
      // Skip to mode selection if PIN already set
      setStep("mode");
    }
  }, [user]);

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      toast.error(t("pinMustBe4Digits"));
      return;
    }

    if (!user?.confessionPin) {
      // First time - set the PIN
      setConfessionPin(pin);
      toast.success(t("pinSetSuccess"));
    } else if (pin !== user.confessionPin) {
      toast.error(t("incorrectPin"));
      return;
    }

    setStep("mode");
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

  const handleSubmit = () => {
    if (!confession.trim()) {
      toast.error(t("pleaseWriteSomething"));
      return;
    }

    // Check for crisis keywords
    if (checkForCrisisWords(confession)) {
      setShowCrisisResources(true);
      return;
    }

    // Save confession with delete option
    const confessions = JSON.parse(localStorage.getItem("confessions") || "[]");
    const newConfession = {
      id: Date.now(),
      text: confession,
      mode,
      deleteOption,
      createdAt: new Date().toISOString(),
      userId: user?.email,
    };
    confessions.push(newConfession);
    localStorage.setItem("confessions", JSON.stringify(confessions));

    // Schedule deletion if needed
    if (deleteOption !== "never") {
      const deleteTime = {
        now: 0,
        "1hour": 3600000,
        "1week": 604800000,
        "1month": 2592000000,
      }[deleteOption];

      if (deleteTime === 0) {
        // Delete immediately after showing response
        setTimeout(() => {
          const updatedConfessions = confessions.filter(
            (c: any) => c.id !== newConfession.id
          );
          localStorage.setItem("confessions", JSON.stringify(updatedConfessions));
        }, 10000); // Delete after 10 seconds
      }
    }

    setShowVideo(true);
    setStep("response");
  };

  const handleVideoError = () => {
    // Show next video or fallback to letter
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setShowVideo(false);
    }
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
            <p className="text-gray-700 mb-6">
              {t("youAreNotAloneReachOut")}
            </p>
            <Button
              onClick={() => navigate("/emergency")}
              className="bg-red-500 hover:bg-red-600"
            >
              {t("viewEmergencyResources")}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">{t("confessTitle")}</h1>
        <p className="text-gray-600">{t("confessSubtitle")}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "pin" && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="p-8">
              <div className="text-center mb-6">
                <Lock className="size-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl mb-2">{t("enterPin")}</h3>
                <p className="text-sm text-gray-600">
                  {user?.confessionPin
                    ? t("enterPinToAccess")
                    : t("setPinToProtectConfessions")}
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
          </motion.div>
        )}

        {step === "mode" && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="p-8">
              <h3 className="text-2xl mb-6 text-center">{t("chooseYourMode")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMode("ai");
                    setStep("confess");
                  }}
                  className={`p-6 rounded-xl cursor-pointer border-2 ${
                    mode === "ai"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  }`}
                >
                  <Sparkles className="size-10 text-purple-500 mb-3" />
                  <h4 className="text-lg mb-2">{t("withAI")}</h4>
                  <p className="text-sm text-gray-600">
                    {t("withAIDesc")}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMode("noai");
                    setStep("confess");
                  }}
                  className={`p-6 rounded-xl cursor-pointer border-2 ${
                    mode === "noai"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <MessageSquare className="size-10 text-blue-500 mb-3" />
                  <h4 className="text-lg mb-2">{t("withoutAI")}</h4>
                  <p className="text-sm text-gray-600">
                    {t("withoutAIDesc")}
                  </p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "confess" && (
          <motion.div
            key="confess"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="p-8">
              <Textarea
                placeholder={t("enterConfession")}
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                className="min-h-64 mb-4"
              />

              <div className="mb-4">
                <label className="block text-sm mb-2">{t("deleteOption")}</label>
                <Select value={deleteOption} onValueChange={setDeleteOption}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">{t("deleteNow")}</SelectItem>
                    <SelectItem value="1hour">{t("deleteAfter1Hour")}</SelectItem>
                    <SelectItem value="1week">{t("deleteAfter1Week")}</SelectItem>
                    <SelectItem value="1month">{t("deleteAfter1Month")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("mode")}>
                  {t("back")}
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {t("submit")}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "response" && (
          <motion.div
            key="response"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {showVideo ? (
              <Card className="p-8 mb-6">
                <h3 className="text-xl mb-4 text-center">{t("heresSomethingForYou")}</h3>
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videos[currentVideoIndex]}`}
                    title="Uplifting Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={handleVideoError}
                  ></iframe>
                </div>
              </Card>
            ) : (
              <Card className="p-8 mb-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <h3 className="text-2xl mb-4 text-center">{t("letterFromFriendTitle")}</h3>
                <div className="prose prose-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {t("dearFriend")}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t("friendLetterPara1")}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t("friendLetterPara2")}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t("friendLetterPara3")}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t("friendLetterSignature")}
                  </p>
                </div>
              </Card>
            )}

            {mode === "ai" && (
              <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium mb-2">{t("aiSupportMessage")}</h4>
                    <p className="text-gray-700">{t("aiResponse")}</p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex gap-3">
              <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                {t("goHome")}
              </Button>
              <Button
                onClick={() => {
                  setStep("mode");
                  setConfession("");
                  setShowVideo(false);
                  setCurrentVideoIndex(0);
                }}
                className="flex-1"
              >
                {t("newConfession")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
