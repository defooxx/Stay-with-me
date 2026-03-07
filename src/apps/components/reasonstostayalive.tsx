import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { Upload, Heart, X, Youtube } from "lucide-react";
import { Button } from "./UI/button";
import { Card } from "./UI/card";
import { toast } from "sonner";

export function ReasonsToStayAlive() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<string[]>([]);
  const [showVideos, setShowVideos] = useState(false);

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
    { id: "tYzMYcUty6s", title: "Never Give Up - Motivational Video" },
    { id: "ZXsQAXx_ao0", title: "Your Life Is Worth Living" },
    { id: "mgmVOuLgFB0", title: "This Too Shall Pass" },
    { id: "kGOQfLFzJj8", title: "You Are Not Alone" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <motion.div
            className="inline-block mb-4"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Heart className="size-16 text-pink-500 fill-pink-500 mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl mb-4 font-light">
            {t("reasonsToStayAlive")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("reasonsSubtitle")}
          </p>
        </div>

        {/* Photo Upload Section */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl mb-4 flex items-center gap-2">
            <Upload className="size-6 text-purple-500" />
            {t("uploadPhotos")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("uploadPhotosHelp")}
          </p>

          <label className="block">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button asChild className="w-full cursor-pointer">
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="size-4 mr-2" />
                {t("choosePhotos")}
              </label>
            </Button>
          </label>

          {photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4"
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
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {photos.length > 0 && (
            <div className="mt-6">
              <Button
                onClick={() => setShowVideos(true)}
                className="w-full"
                variant="default"
              >
                {t("continueToVideos")}
              </Button>
            </div>
          )}
        </Card>

        {/* YouTube Videos Section */}
        {(showVideos || photos.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <Youtube className="size-6 text-red-500" />
                {t("wordsOfHope")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("wordsOfHopeDesc")}
              </p>

              <div className="space-y-6">
                {inspirationalVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-lg overflow-hidden shadow-lg"
                  >
                    <h3 className="text-lg font-medium mb-2 px-2">
                      {video.title}
                    </h3>
                    <div className="relative pb-[56.25%] h-0">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Encouraging Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8"
        >
          <p className="text-xl text-gray-800 mb-4 italic">
            "Every person's life is a story worth telling. Your chapters are still
            being written, and there are beautiful pages ahead."
          </p>
          <p className="text-gray-700">
            You matter. Your presence in this world makes a difference, even when
            it doesn't feel like it.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
