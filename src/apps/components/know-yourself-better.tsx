import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
import { Badge } from "./UI/badge";
import { Brain, Compass, HeartHandshake, Sparkles } from "lucide-react";
import { mentalHealthTopics } from "../data/mental-health";
import { useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import {
  useTranslatedText,
  useTranslatedTexts,
} from "../hooks/useRuntimeTranslation";

const feelingPaths = [
  {
    id: "anxious",
    title: "I feel anxious or on edge",
    description: "Fast thoughts, fear, panic, social worry, or constant stress.",
    topicIds: ["anxiety", "gad", "panic", "social-anxiety", "phobia", "agoraphobia", "ocd"],
  },
  {
    id: "low",
    title: "I feel low, numb, or exhausted",
    description: "Heavy mood, low energy, no motivation, or hopelessness.",
    topicIds: ["depression", "pdd", "bipolar-1", "bipolar-2", "cyclothymia"],
  },
  {
    id: "sleep",
    title: "My sleep or body feels off",
    description: "Sleep trouble, physical stress, health anxiety, or overwhelm in the body.",
    topicIds: ["insomnia", "narcolepsy", "somatic", "illness-anxiety", "acute-stress"],
  },
  {
    id: "focus",
    title: "I cannot focus or regulate myself well",
    description: "Attention issues, impulsivity, sensory overload, or emotional intensity.",
    topicIds: ["adhd", "autism", "bpd", "ptsd", "dissociative"],
  },
];

export function KnowYourselfBetter() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedPathId, setSelectedPathId] = useState(feelingPaths[0].id);
  const [selectedTopicId, setSelectedTopicId] = useState(feelingPaths[0].topicIds[0]);
  const selectedPath = useMemo(
    () => feelingPaths.find((path) => path.id === selectedPathId) || feelingPaths[0],
    [selectedPathId]
  );
  const visibleTopics = useMemo(
    () => mentalHealthTopics.filter((topic) => selectedPath.topicIds.includes(topic.id)),
    [selectedPath]
  );
  const selectedTopic = useMemo(
    () => mentalHealthTopics.find((topic) => topic.id === selectedTopicId) || mentalHealthTopics[0],
    [selectedTopicId]
  );
  const pageTitle = useTranslatedText("Know Yourself Better");
  const pageDescription = useTranslatedText(
    "Start with what feels most familiar. This page helps users notice patterns, learn gently, and choose what to explore next."
  );
  const understandingFirst = useTranslatedText("Understanding First");
  const promptTitle = useTranslatedText("Does one of these feel close to what you're going through?");
  const promptDescription = useTranslatedText(
    "This is educational, not a diagnosis. Start with the experience that feels most familiar, then explore a few related topics without getting lost in a long clinical list."
  );
  const needActionInstead = useTranslatedText("Need action instead?");
  const feelingPathsTitle = useTranslatedText("Feeling Paths");
  const relatedTopicsTitle = useTranslatedText("Related topics");
  const educationalLabel = useTranslatedText("Educational");
  const commonSignsTitle = useTranslatedText("Common signs people notice");
  const explainerTitle = useTranslatedText("A gentle explainer");
  const gentleNotice = useTranslatedText(
    "If this topic feels close to home, the next best step is not to label yourself quickly. Learn a little, notice patterns, and then use Seek Help for practical support options."
  );
  const feelingPathTexts = useTranslatedTexts(
    feelingPaths.flatMap((path) => [path.title, path.description])
  );
  const visibleTopicTexts = useTranslatedTexts(
    visibleTopics.flatMap((topic) => [topic.name, topic.shortDescription])
  );
  const selectedTopicSymptoms = useTranslatedTexts(selectedTopic.symptoms);
  const selectedTopicName = useTranslatedText(selectedTopic.name);
  const selectedTopicDescription = useTranslatedText(selectedTopic.shortDescription);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">{pageTitle}</h1>
        <p className="text-gray-600">
          {pageDescription}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-6 rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/55"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-indigo-500">{understandingFirst}</p>
            <h2 className="mt-2 text-2xl font-medium">{promptTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-slate-300">
              {promptDescription}
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/seek-help")}>
            <HeartHandshake className="size-4 mr-2" />
            {needActionInstead}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:items-start lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="self-start p-4 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="size-5 text-indigo-600" />
            <h2 className="text-xl">{feelingPathsTitle}</h2>
          </div>
          <div className="space-y-3">
            {feelingPaths.map((path, index) => (
              <button
                key={path.id}
                type="button"
                onClick={() => {
                  setSelectedPathId(path.id);
                  setSelectedTopicId(path.topicIds[0]);
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedPathId === path.id
                    ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60"
                }`}
              >
                <p className="font-medium">{feelingPathTexts[index * 2] || path.title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
                  {feelingPathTexts[index * 2 + 1] || path.description}
                </p>
              </button>
            ))}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-5 text-pink-500" />
              <h2 className="text-xl">{relatedTopicsTitle}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleTopics.map((topic, index) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedTopicId === topic.id
                      ? "border-pink-400 bg-pink-50 dark:border-pink-500 dark:bg-pink-950/30"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60"
                  }`}
                >
                  <p className="font-medium">{visibleTopicTexts[index * 2] || topic.name}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
                    {visibleTopicTexts[index * 2 + 1] || topic.shortDescription}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="size-5 text-indigo-600" />
                  <h3 className="text-2xl">{selectedTopicName}</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300 max-w-3xl">{selectedTopicDescription}</p>
              </div>
              <Badge variant="secondary">{educationalLabel}</Badge>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div>
                <h4 className="text-base mb-3">{commonSignsTitle}</h4>
                <div className="grid gap-3">
                  {selectedTopic.symptoms.map((symptom, index) => (
                    <div key={symptom} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <p className="text-sm text-gray-700 dark:text-slate-200">{selectedTopicSymptoms[index] || symptom}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p className="text-sm leading-6 text-amber-900 dark:text-amber-100">
                    {gentleNotice}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-base mb-3">{explainerTitle}</h4>
                <div className="aspect-video overflow-hidden rounded-2xl border border-blue-100 dark:border-slate-700">
                  <iframe
                    title={`${selectedTopicName} ${t("howItWorks")}`}
                    src={`https://www.youtube.com/embed/${selectedTopic.videoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
