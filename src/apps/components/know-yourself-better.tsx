import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
import { Badge } from "./UI/badge";
import { Brain } from "lucide-react";
import { mentalHealthTopics } from "../data/mental-health";

export function KnowYourselfBetter() {
  const [selectedTopicId, setSelectedTopicId] = useState(mentalHealthTopics[0].id);
  const selectedTopic = useMemo(
    () => mentalHealthTopics.find((topic) => topic.id === selectedTopicId) || mentalHealthTopics[0],
    [selectedTopicId]
  );

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">Know Yourself Better</h1>
        <p className="text-gray-600">
          A broad world-wide list of mental illnesses, with symptoms and an educational video for each topic.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
        <Card className="p-4 max-h-[72vh] overflow-auto">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="size-5 text-indigo-600" />
            <h2 className="text-xl">Mental Illness List</h2>
          </div>
          <div className="space-y-2">
            {mentalHealthTopics.map((topic) => (
              <Button
                key={topic.id}
                variant={selectedTopicId === topic.id ? "default" : "outline"}
                className="justify-start w-full text-left h-auto py-2"
                onClick={() => setSelectedTopicId(topic.id)}
              >
                {topic.name}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl">{selectedTopic.name}</h3>
            <Badge variant="secondary">Symptoms</Badge>
          </div>
          <p className="text-sm text-gray-700 mb-4">{selectedTopic.shortDescription}</p>
          <h4 className="text-base mb-2">Common Symptoms</h4>
          <ul className="space-y-2 mb-4">
            {selectedTopic.symptoms.map((symptom) => (
              <li key={symptom} className="text-sm text-gray-700">
                - {symptom}
              </li>
            ))}
          </ul>

          <div className="aspect-video overflow-hidden rounded-lg border border-blue-100">
            <iframe
              title={`${selectedTopic.name} animated explanation`}
              src={`https://www.youtube.com/embed/${selectedTopic.videoId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
