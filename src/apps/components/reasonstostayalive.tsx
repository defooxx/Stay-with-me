import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { Upload, Heart, X, Youtube, Sparkles, ImagePlus } from "lucide-react";
import { Button } from "./UI/button";
import { Card } from "./UI/card";
import { toast } from "sonner";

export function ReasonsToStayAlive() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("nS8Lim2OlK0");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const maxFiles = 10;

    if (photos.length + fileArray.length > maxFiles) {
      toast.error(t("maxPhotosError").replace("{max}", String(maxFiles)));
      return;
    }

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    toast.success(t("photosUploaded"));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const inspirationalVideos = [
    { id: "nS8Lim2OlK0", title: "Motivational Support Video" },
    { id: "mgmVOuLgFB0", title: "This Too Shall Pass" },
    { id: "1P3ZgLOy-w8", title: "You Are Not Alone" },
    { id: "Bl1FOKpFY2Q", title: "Life Motivation Video" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-10">
          <motion.div
            className="inline-block mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="size-16 text-pink-500 fill-pink-500 mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl mb-4 font-light">{t("reasonsToStayAlive")}</h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-slate-300">{t("reasonsSubtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus className="size-6 text-purple-500" />
              <h2 className="text-2xl">{t("uploadPhotos")}</h2>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-6">{t("uploadPhotosHelp")}</p>

            <div className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
              />
              <Button asChild className="w-full cursor-pointer rounded-full">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="size-4 mr-2" />
                  {t("choosePhotos")}
                </label>
              </Button>
            </div>

            <div className="mt-6">
              {photos.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                  <Sparkles className="size-8 text-pink-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Add photos of loved ones, places, pets, or memories that remind you life is larger than this moment.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 gap-4 md:grid-cols-3"
                >
                  {photos.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={photo}
                        alt={`Memory ${index + 1}`}
                        className="h-44 w-full rounded-2xl object-cover shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="size-4" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl mb-4 flex items-center gap-2">
              <Youtube className="size-6 text-red-500" />
              {t("wordsOfHope")}
            </h2>
            <p className="text-gray-600 dark:text-slate-300 mb-6">{t("wordsOfHopeDesc")}</p>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="relative h-0 pb-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideoId}`}
                  title="Words of hope"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 h-full w-full"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {inspirationalVideos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setSelectedVideoId(video.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedVideoId === video.id
                      ? "border-pink-400 bg-pink-50 dark:border-pink-500 dark:bg-pink-950/30"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60"
                  }`}
                >
                  <p className="font-medium">{video.title}</p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">Play this when you need a steadier voice in the room.</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-[2rem] bg-gradient-to-r from-purple-100 to-pink-100 p-8 text-center dark:from-slate-800 dark:to-slate-700"
        >
          <p className="text-xl text-gray-800 dark:text-slate-100 mb-4 italic">
            "Every person's life is a story worth telling. Your chapters are still being written, and there are beautiful pages ahead."
          </p>
          <p className="text-gray-700 dark:text-slate-200">
            You matter. Your presence in this world makes a difference, even when it does not feel like it.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
