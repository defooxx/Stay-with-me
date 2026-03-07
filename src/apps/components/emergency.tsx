import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Wind, Brain, Play, Pause } from "lucide-react";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./UI/tabs";

export function EmergencyResources() {
  const { t } = useLanguage();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");

  const startBreathingExercise = () => {
    setBreathingActive(true);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    const cycle = async () => {
      while (breathingActive) {
        // Inhale - 4 seconds
        setBreathingPhase("inhale");
        await new Promise((resolve) => setTimeout(resolve, 4000));
        
        // Hold - 4 seconds
        setBreathingPhase("hold");
        await new Promise((resolve) => setTimeout(resolve, 4000));
        
        // Exhale - 4 seconds
        setBreathingPhase("exhale");
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    };
    cycle();
  };

  const calmingExercises = [
    {
      title: "5-4-3-2-1 Grounding Technique",
      description: "A powerful technique to bring you back to the present moment.",
      steps: [
        "Name 5 things you can see around you",
        "Name 4 things you can touch",
        "Name 3 things you can hear",
        "Name 2 things you can smell",
        "Name 1 thing you can taste",
      ],
    },
    {
      title: "Progressive Muscle Relaxation",
      description: "Release tension from your body systematically.",
      steps: [
        "Sit or lie down in a comfortable position",
        "Tense your feet muscles for 5 seconds, then release",
        "Move up to your calves, thighs, abdomen",
        "Continue to shoulders, arms, and hands",
        "Finish with your face and jaw",
        "Take deep breaths throughout",
      ],
    },
    {
      title: "Safe Place Visualization",
      description: "Create a mental sanctuary.",
      steps: [
        "Close your eyes and take a deep breath",
        "Imagine a place where you feel completely safe",
        "Notice the details - colors, sounds, smells",
        "Feel the peace this place brings you",
        "Stay here as long as you need",
      ],
    },
  ];

  const meditationVideos = [
    {
      title: "5-Minute Guided Meditation",
      videoId: "inpok4MKVLM",
    },
    {
      title: "Calm Your Mind",
      videoId: "ZToicYcHIOU",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">{t("emergencyTitle")}</h1>
        <p className="text-gray-600">{t("emergencySubtitle")}</p>
      </motion.div>

      {/* Crisis Hotlines */}
      <Card className="p-6 mb-8 bg-red-50 border-red-200">
        <div className="flex items-start gap-4">
          <Heart className="size-8 text-red-500 mt-1" />
          <div>
            <h3 className="text-xl mb-2 text-red-800">{t("ifInCrisis")}</h3>
            <p className="text-red-700 mb-3">
              {t("pleaseReachImmediateHelp")}
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>National Suicide Prevention Lifeline (US):</strong>{" "}
                <a href="tel:988" className="text-blue-600 hover:underline">
                  988
                </a>
              </p>
              <p>
                <strong>Crisis Text Line:</strong> Text "HELLO" to{" "}
                <a href="sms:741741" className="text-blue-600 hover:underline">
                  741741
                </a>
              </p>
              <p>
                <strong>International:</strong>{" "}
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  findahelpline.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="breathing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breathing">
            <Wind className="size-4 mr-2" />
            {t("breathingExercise")}
          </TabsTrigger>
          <TabsTrigger value="calming">
            <Heart className="size-4 mr-2" />
            {t("calmingExercises")}
          </TabsTrigger>
          <TabsTrigger value="meditation">
            <Brain className="size-4 mr-2" />
            {t("guidedMeditation")}
          </TabsTrigger>
        </TabsList>

        {/* Breathing Exercise */}
        <TabsContent value="breathing">
          <Card className="p-8">
            <div className="text-center">
              <h3 className="text-2xl mb-4">{t("boxBreathingTitle")}</h3>
              <p className="text-gray-600 mb-8">
                {t("boxBreathingDesc")}
              </p>

              <div className="mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={breathingPhase}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative w-64 h-64 mx-auto"
                  >
                    <motion.div
                      animate={{
                        scale: breathingActive
                          ? breathingPhase === "inhale"
                            ? 1.5
                            : breathingPhase === "exhale"
                            ? 0.7
                            : 1.2
                          : 1,
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                    >
                      <div className="text-white text-center">
                        <p className="text-3xl font-light mb-2">
                          {breathingPhase === "inhale" && t("breatheIn")}
                          {breathingPhase === "hold" && t("hold")}
                          {breathingPhase === "exhale" && t("breatheOut")}
                        </p>
                        <p className="text-lg opacity-80">{t("fourSeconds")}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <Button
                size="lg"
                onClick={() => setBreathingActive(!breathingActive)}
                className="w-48"
              >
                {breathingActive ? (
                  <>
                    <Pause className="size-5 mr-2" />
                    {t("stop")}
                  </>
                ) : (
                  <>
                    <Play className="size-5 mr-2" />
                    {t("start")}
                  </>
                )}
              </Button>

              <div className="mt-8 text-left max-w-md mx-auto">
                <h4 className="font-medium mb-2">{t("howItWorks")}</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>{t("breatheIn4")}</li>
                  <li>{t("hold4")}</li>
                  <li>{t("breatheOut4")}</li>
                  <li>{t("rest4")}</li>
                  <li>{t("repeatAsNeeded")}</li>
                </ol>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Calming Exercises */}
        <TabsContent value="calming">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calmingExercises.map((exercise, index) => (
              <motion.div
                key={exercise.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <h3 className="text-lg mb-2">{exercise.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {exercise.steps.map((step, i) => (
                      <li key={i} className="text-gray-700">
                        {step}
                      </li>
                    ))}
                  </ol>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Guided Meditation */}
        <TabsContent value="meditation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meditationVideos.map((video, index) => (
              <motion.div
                key={video.videoId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg mb-4">{video.title}</h3>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
