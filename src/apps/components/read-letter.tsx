import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { Mail, Heart, PenLine, RefreshCw } from "lucide-react";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
import { format } from "date-fns";

interface Letter {
  id: number;
  text: string;
  createdAt: string;
  authorNickname: string;
}

export function ReadLetters() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    loadLetters();
  }, [language]);

  useEffect(() => {
    setCurrentLetterIndex((prev) => {
      if (letters.length === 0) return 0;
      return Math.min(prev, letters.length - 1);
    });
  }, [letters.length]);

  const getDefaultLetters = (): Letter[] => {
    const now = Date.now();
    return [
      {
        id: 1,
        text: t("defaultReadLetter1Text"),
        createdAt: new Date(now - 86400000).toISOString(),
        authorNickname: "HopefulStar247",
      },
      {
        id: 2,
        text: t("defaultReadLetter2Text"),
        createdAt: new Date(now - 172800000).toISOString(),
        authorNickname: "KindHeart891",
      },
      {
        id: 3,
        text: t("defaultReadLetter3Text"),
        createdAt: new Date(now - 259200000).toISOString(),
        authorNickname: "GentleSpirit456",
      },
      {
        id: 4,
        text: t("defaultReadLetter4Text"),
        createdAt: new Date(now - 345600000).toISOString(),
        authorNickname: "BrightMoon123",
      },
    ];
  };

  const isLegacyDefaultLetter = (letter: Letter): boolean => {
    return (
      [1, 2, 3, 4].includes(letter.id) &&
      ["HopefulStar247", "KindHeart891", "GentleSpirit456", "BrightMoon123"].includes(
        letter.authorNickname
      )
    );
  };

  const loadLetters = () => {
    const storedLetters = JSON.parse(
      localStorage.getItem("communityLetters") || "[]"
    );

    // Keep user letters in storage, but render default letters from i18n so they update with language switch.
    const userLetters = (storedLetters as Letter[]).filter(
      (letter) => !isLegacyDefaultLetter(letter)
    );
    const allLetters = [...userLetters, ...getDefaultLetters()];

    // Sort by newest first
    const sortedLetters = allLetters.sort(
      (a: Letter, b: Letter) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setLetters(sortedLetters);
  };

  const nextLetter = () => {
    setCurrentLetterIndex((prev) => (prev + 1) % letters.length);
  };

  const previousLetter = () => {
    setCurrentLetterIndex((prev) => (prev - 1 + letters.length) % letters.length);
  };

  const randomLetter = () => {
    const randomIndex = Math.floor(Math.random() * letters.length);
    setCurrentLetterIndex(randomIndex);
  };

  if (letters.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-12">
            <Mail className="size-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl mb-4">{t("noLettersYet")}</h2>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              {t("beFirstToSharePositivity")}
            </p>
            <Button onClick={() => navigate("/write-letter")}>
              <PenLine className="size-4 mr-2" />
              {t("writeLetter")}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentLetter = letters[currentLetterIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">{t("readLettersTitle")}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t("readLettersSubtitle")}</p>
      </motion.div>

      <motion.div
        key={currentLetter.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-8 md:p-12 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-xl">
          <motion.div
            className="mb-6"
            animate={{ scale: [1, 1.14, 1] }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="size-12 text-pink-500 fill-pink-500 mx-auto mb-4" />
          </motion.div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed text-center">
              {currentLetter.text}
            </p>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 dark:text-slate-300">
              <p className="font-medium">{t("fromLabel")} {currentLetter.authorNickname}</p>
              <p>{format(new Date(currentLetter.createdAt), "PPP")}</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {currentLetterIndex + 1} of {letters.length}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Navigation Controls */}
      <div className="flex gap-3 mt-6 justify-center">
        <Button onClick={previousLetter} variant="outline">
          {t("previous")}
        </Button>
        <Button onClick={randomLetter} variant="outline">
          <RefreshCw className="size-4 mr-2" />
          {t("random")}
        </Button>
        <Button onClick={nextLetter} variant="outline">
          {t("next")}
        </Button>
      </div>

      {/* Write Letter CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8"
      >
        <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-slate-800 dark:to-slate-700">
          <p className="text-gray-700 dark:text-slate-100 mb-4">{t("shareOwnMessageCta")}</p>
          <Button onClick={() => navigate("/write-letter")}>
            <PenLine className="size-4 mr-2" />
            {t("writeLetter")}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
