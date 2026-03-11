import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Heart, Phone, Brain, HandHeart } from "lucide-react";
import { useNavigate } from "react-router";
import { getEmergencyContactsByCountry } from "../data/emergency-contacts";
import { useTranslatedText } from "../hooks/useRuntimeTranslation";

export function Footer() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const knowYourselfBetterTitle = useTranslatedText("Know Yourself Better");
  const knowYourselfBetterDescription = useTranslatedText(
    "Explore mental illnesses, symptoms, and educational videos."
  );
  const seekHelpTitle = useTranslatedText("Seek Help");
  const seekHelpDescription = useTranslatedText(
    "Condition-wise solutions and trusted free CBT/DBT-style resources."
  );
  const countryCode = user?.countryCode || "US";
  const countryName = user?.countryName || "United States";
  const countryEmergencyResources = getEmergencyContactsByCountry(countryCode, countryName);

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900 border-t border-purple-100 dark:border-slate-700 mt-16"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Main Footer Message */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-block mb-4"
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="size-12 text-pink-500 fill-pink-500 mx-auto" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl mb-4 font-light text-gray-800 dark:text-slate-100">
              {t("footerMessage")}
            </h3>
            <p className="text-lg text-gray-700 dark:text-slate-200 mb-2">
              {t("footerStrengthLine")}
            </p>
          </div>

          {/* Quick Access: below "We care about you..." */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => navigate("/know-yourself")}
              className="bg-white/70 dark:bg-slate-800 rounded-lg p-6 text-left border border-cyan-200 dark:border-slate-700 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="size-5 text-cyan-600" />
                <h4 className="font-semibold text-cyan-700 dark:text-cyan-300">{knowYourselfBetterTitle}</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-200">
                {knowYourselfBetterDescription}
              </p>
            </button>

            <button
              onClick={() => navigate("/seek-help")}
              className="bg-white/70 dark:bg-slate-800 rounded-lg p-6 text-left border border-emerald-200 dark:border-slate-700 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <HandHeart className="size-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">{seekHelpTitle}</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-200">
                {seekHelpDescription}
              </p>
            </button>
          </div>

          {/* Crisis Support */}
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-3 flex items-center gap-2">
              <Phone className="size-5" />
              {t("ifInCrisisReachOut")} - {countryName}
            </h4>
            <div className="space-y-2 text-sm text-red-800 dark:text-red-200">
              {countryEmergencyResources.map((item) => (
                <p key={item.label}>
                  <strong>{item.label}:</strong>{" "}
                  {item.text}{" "}
                  <a
                    href={item.link}
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="font-semibold hover:underline"
                  >
                    {item.linkLabel}
                  </a>
                </p>
              ))}
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="text-center text-sm text-gray-600 dark:text-slate-300 border-t border-purple-200 dark:border-slate-700 pt-6">
            <p className="mb-2">
              © 2026 {t("appName")} - {t("safeSpaceMentalHealth")}
            </p>
            <p className="italic">
              {t("footerQuote")}
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
