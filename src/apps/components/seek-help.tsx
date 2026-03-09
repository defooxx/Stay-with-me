import { motion } from "motion/react";
import { Card } from "./UI/card";
import { BookOpen, HeartPulse, ShieldCheck } from "lucide-react";
import { helpGuides, mentalHealthTopics } from "../data/mental-health";

const genericSolutions = [
  "Maintain regular sleep, hydration, and movement routines.",
  "Use paced breathing and grounding during emotional overload.",
  "Reduce stimulants and screen stress, especially at night.",
  "Track symptoms and triggers in a journal for pattern awareness.",
  "Reach out early to a trusted person and a qualified clinician.",
];

const genericResource = {
  title: "NIMH Mental Health Information (Trusted, free, evidence-based)",
  url: "https://www.nimh.nih.gov/health/topics",
  source: "U.S. National Institute of Mental Health",
};

const getGuideForTopic = (topicName: string) => {
  const mapped = helpGuides.find((guide) => {
    const key = guide.heading.toLowerCase();
    return (
      (topicName.toLowerCase().includes("anxiety") && key.includes("anxiety")) ||
      (topicName.toLowerCase().includes("panic") && key.includes("panic")) ||
      (topicName.toLowerCase().includes("depress") && key.includes("depression")) ||
      (topicName.toLowerCase().includes("insomnia") && key.includes("insomnia"))
    );
  });

  if (mapped) {
    return mapped;
  }

  return {
    heading: `Solutions for ${topicName}`,
    solutions: genericSolutions,
    resource: genericResource,
  };
};

export function SeekHelpPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">Seek Help</h1>
        <p className="text-gray-600">
          Practical solutions organized by condition with trusted CBT/DBT-style free resources.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {mentalHealthTopics.map((topic) => {
          const guide = getGuideForTopic(topic.name);
          return (
          <Card key={topic.id} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <HeartPulse className="size-5 text-emerald-600" />
              <h2 className="text-xl">{`Solutions for ${topic.name}`}</h2>
            </div>

            <div className="space-y-2 mb-4">
              {guide.solutions.map((solution) => (
                <p key={solution} className="text-sm text-gray-700">
                  - {solution}
                </p>
              ))}
            </div>

            <a
              href={guide.resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"
            >
              <BookOpen className="size-4" />
              {guide.resource.title}
            </a>
            <p className="text-xs text-gray-500 mt-1">{guide.resource.source}</p>
          </Card>
        );
        })}
      </div>

      <Card className="p-5 mt-5 border-emerald-200 bg-emerald-100/60">
        <div className="flex items-start gap-2">
          <ShieldCheck className="size-5 text-emerald-700 mt-0.5" />
          <p className="text-sm text-emerald-900">
            If symptoms are severe, frequent, or affecting your safety and daily life, please seek professional care from a psychiatrist, psychologist, or licensed doctor nearby.
          </p>
        </div>
      </Card>
    </div>
  );
}
