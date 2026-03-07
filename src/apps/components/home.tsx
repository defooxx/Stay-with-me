import { useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { useState } from "react";
import {
  MessageSquare,
  BookOpen,
  Smile,
  HeartPulse,
  PenLine,
  Mail,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card } from "./UI/card";

export function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Positive messages that rotate on refresh
  const positiveMessages = [
    t("welcome"),
    t("homePositiveMessage"),
  ];

  const [currentMessage] = useState(() => {
    return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
  });

  const features = [
    {
      icon: MessageSquare,
      title: t("confess"),
      description: t("confessSubtitle"),
      path: "/confess",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      title: t("journal"),
      description: t("homeJournalDesc"),
      path: "/journal",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Smile,
      title: t("moodTracker"),
      description: t("homeMoodDesc"),
      path: "/mood",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: HeartPulse,
      title: t("emergency"),
      description: t("homeEmergencyDesc"),
      path: "/emergency",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: Heart,
      title: t("reasonsToStayAlive"),
      description: t("homeReasonsDesc"),
      path: "/reasons-to-stay",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: PenLine,
      title: t("writeLetter"),
      description: t("writeLetterSubtitle"),
      path: "/write-letter",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: Mail,
      title: t("readLetters"),
      description: t("homeReadLettersDesc"),
      path: "/read-letters",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-20 px-4"
      >
        {/* Decorative Element */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="size-12 text-purple-500 mx-auto" />
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-purple-300 blur-xl -z-10"
            />
          </div>
        </motion.div>

        {/* Main Heading with Gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 font-light tracking-tight leading-tight"
        >
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            {currentMessage}
          </span>
        </motion.h1>

        {/* Subtitle with better typography */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
        >
          {t("welcomeSubtitle")}
        </motion.p>

        {/* Confidentiality Promise with enhanced design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-2xl opacity-20 rounded-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-3xl p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Heart className="size-8 text-pink-500 fill-pink-500 flex-shrink-0 mt-1" />
              </motion.div>
              <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
                {t("confidentialityPromise")}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Section Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">
            {t("homeSafeSpaceTitle")}
          </h2>
          <p className="text-gray-600 text-lg">
            {t("homeSafeSpaceSubtitle")}
          </p>
        </div>
      </motion.div>

      {/* Features Grid with enhanced cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 h-full border-2 border-transparent hover:border-purple-200 relative overflow-hidden group"
                onClick={() => navigate(feature.path)}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="size-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl mb-3 font-medium text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Terms Notice with better styling */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="text-center mt-16 mb-8"
      >
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {t("termsAndConditions")}
        </p>
      </motion.div>
    </div>
  );
}
