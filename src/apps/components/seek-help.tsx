import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Card } from "./UI/card";
import { BookOpen, HeartPulse, ShieldCheck, Phone, Waves, UserRoundCheck } from "lucide-react";
import { Button } from "./UI/button";
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
  const navigate = useNavigate();
  const supportTracks = [
    {
      id: "urgent",
      title: "I need help right now",
      description: "Use this when safety, panic, or emotional overload feels immediate.",
      icon: Phone,
    },
    {
      id: "self",
      title: "I need something I can do today",
      description: "Small actions, grounding, and regulated support for the next hour.",
      icon: Waves,
    },
    {
      id: "professional",
      title: "I think I need proper support",
      description: "Use this when symptoms keep repeating or daily life is getting harder.",
      icon: UserRoundCheck,
    },
  ] as const;
  const [selectedTrackId, setSelectedTrackId] = useState<(typeof supportTracks)[number]["id"]>("self");
  const selectedTrack = supportTracks.find((track) => track.id === selectedTrackId) || supportTracks[1];
  const spotlightGuides = useMemo(
    () => mentalHealthTopics.slice(0, 6).map((topic) => ({
      topic,
      guide: getGuideForTopic(topic.name),
    })),
    []
  );

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">Seek Help</h1>
        <p className="text-gray-600">
          This page should help users act, not keep searching. Start with the kind of help you need, then take one next step.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-6 rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/55"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-500">Take Action</p>
            <h2 className="mt-2 text-2xl font-medium">Pick the type of support you need</h2>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/know-yourself")}>
            Learn about feelings first
          </Button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {supportTracks.map((track) => {
            const Icon = track.icon;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrackId(track.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedTrackId === track.id
                    ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-5 text-emerald-600 dark:text-emerald-300" />
                  <p className="font-medium">{track.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">{track.description}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="size-5 text-emerald-600" />
            <h2 className="text-xl">{selectedTrack.title}</h2>
          </div>
          {selectedTrackId === "urgent" && (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-gray-700 dark:text-slate-300">
                If this feels urgent, do not keep browsing. Move toward safety, another person, or emergency resources now.
              </p>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-950/20">
                  <p className="font-medium text-red-700 dark:text-red-100">Immediate step 1</p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-200">Open Emergency Resources and contact a hotline or local emergency service.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-medium">Immediate step 2</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">Tell one trusted person what is happening in plain words.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-medium">Immediate step 3</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">Go somewhere less isolated and put distance between yourself and anything unsafe.</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate("/emergency")}>
                Open emergency resources
              </Button>
            </div>
          )}

          {selectedTrackId === "self" && (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-gray-700 dark:text-slate-300">
                If users need support today, give them one action they can complete in the next few minutes.
              </p>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-medium">Breathe with the body first</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">Use guided breathing, grounding, water, and sunlight before making bigger decisions.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-medium">Write down what is happening</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">Journal the pattern, what triggered it, and what helped even a little.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-medium">Tell one person early</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">Do not wait until everything gets worse before reaching out.</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate("/shelter")}>
                Open breathing and care tools
              </Button>
            </div>
          )}

          {selectedTrackId === "professional" && (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-gray-700 dark:text-slate-300">
                If symptoms keep repeating, disrupt sleep, work, study, safety, or relationships, move toward qualified support.
              </p>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-medium">Look for a licensed clinician</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">Psychologist, psychiatrist, therapist, counselor, or physician depending on your needs.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-medium">Bring notes</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">Track symptoms, sleep, triggers, and duration so users do not need to remember everything on the spot.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="font-medium">Use trusted free material between sessions</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">Self-help resources are useful, but they should support care, not replace it.</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl mb-4">Practical guides</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {spotlightGuides.map(({ topic, guide }) => (
                <div key={topic.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartPulse className="size-4 text-emerald-600" />
                    <h3 className="font-medium">{topic.name}</h3>
                  </div>
                  <div className="space-y-2 mb-4">
                    {guide.solutions.slice(0, 3).map((solution) => (
                      <p key={solution} className="text-sm text-gray-700 dark:text-slate-300">
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
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border-emerald-200 bg-emerald-100/60 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-5 text-emerald-700 mt-0.5" />
              <p className="text-sm text-emerald-900 dark:text-emerald-100">
                If symptoms are severe, frequent, or affecting safety and daily life, move toward professional care nearby. This page should help users take the next step, not carry it alone.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
