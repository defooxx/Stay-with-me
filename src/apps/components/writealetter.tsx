import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { PenLine, Send } from "lucide-react";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
import { Textarea } from "./UI/textarea";
import { toast } from "sonner";

export function WriteALetter() {
  const [letter, setLetter] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const containsNegativeWords = (text: string) => {
    const negativeWords = [
      "hate",
      "stupid",
      "idiot",
      "loser",
      "ugly",
      "worthless",
      "pathetic",
      "kill",
      "die",
      "death",
      "harm",
      "hurt",
      "bad",
      "terrible",
      "awful",
      "worst",
    ];

    const lowerText = text.toLowerCase();
    return negativeWords.some((word) => lowerText.includes(word));
  };

  const handleSubmit = () => {
    if (!letter.trim()) {
      toast.error(t("pleaseWriteSomething"));
      return;
    }

    if (letter.trim().length < 20) {
      toast.error(t("pleaseWriteAtLeast20Chars"));
      return;
    }

    if (containsNegativeWords(letter)) {
      toast.error(t("positiveWordsOnly"));
      return;
    }

    // Save letter
    const letters = JSON.parse(localStorage.getItem("communityLetters") || "[]");
    const newLetter = {
      id: Date.now(),
      text: letter.trim(),
      createdAt: new Date().toISOString(),
      authorEmail: user?.email,
      authorNickname: user?.nickname || t("anonymous"),
    };
    letters.push(newLetter);
    localStorage.setItem("communityLetters", JSON.stringify(letters));

    toast.success(t("letterSharedSuccess"));
    setLetter("");
    
    // Redirect to read letters
    setTimeout(() => {
      navigate("/read-letters");
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">{t("writeLetterTitle")}</h1>
        <p className="text-gray-600">{t("writeLetterSubtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <PenLine className="size-5 text-purple-500" />
              <h3 className="text-lg">{t("writeYourLetter")}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t("writeLetterGuidance")}
            </p>
          </div>

          <div className="mb-4">
            <Textarea
              placeholder={t("writeLetterPlaceholder")}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="min-h-64 text-base"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {letter.length} {t("charactersMinimum20")}
              </span>
              <span className="text-xs text-gray-500">
                {t("fromLabel")} {user?.nickname || t("anonymous")}
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">{t("guidelines")}</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• {t("guidelinePositiveWords")}</li>
              <li>• {t("guidelineGenuine")}</li>
              <li>• {t("guidelineFriendInNeed")}</li>
              <li>• {t("guidelineAnonymousShare")}</li>
            </ul>
          </div>

          <Button onClick={handleSubmit} className="w-full" size="lg">
            <Send className="size-4 mr-2" />
            {t("sendLetter")}
          </Button>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        <Button variant="outline" onClick={() => navigate("/read-letters")}>
          {t("readLettersFromOthers")}
        </Button>
      </motion.div>
    </div>
  );
}
