import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { Heart, Phone, Mail as MailIcon } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100 mt-16"
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
            <h3 className="text-2xl md:text-3xl mb-4 font-light text-gray-800">
              {t("footerMessage")}
            </h3>
            <p className="text-lg text-gray-700 mb-2">
              {t("footerStrengthLine")}
            </p>
          </div>

          {/* Encouraging Messages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 text-center">
              <h4 className="font-semibold text-purple-700 mb-2">{t("youMatterTitle")}</h4>
              <p className="text-sm text-gray-600">
                {t("youMatterDesc")}
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 text-center">
              <h4 className="font-semibold text-pink-700 mb-2">{t("youreNotAloneTitle")}</h4>
              <p className="text-sm text-gray-600">
                {t("youreNotAloneDesc")}
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 text-center">
              <h4 className="font-semibold text-purple-700 mb-2">{t("hopeExistsTitle")}</h4>
              <p className="text-sm text-gray-600">
                {t("hopeExistsDesc")}
              </p>
            </div>
          </div>

          {/* Crisis Support */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <Phone className="size-5" />
              {t("ifInCrisisReachOut")}
            </h4>
            <div className="space-y-2 text-sm text-red-800">
              <p>
                <strong>National Suicide Prevention Lifeline (US):</strong>{" "}
                988 or 1-800-273-8255
              </p>
              <p>
                <strong>Crisis Text Line:</strong> Text "HELLO" to 741741
              </p>
              <p>
                <strong>International Association for Suicide Prevention:</strong>{" "}
                Find your country's helpline at iasp.info
              </p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="text-center text-sm text-gray-600 border-t border-purple-200 pt-6">
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
