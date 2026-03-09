import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  MessageSquare,
  Lock,
  AlertCircle,
  Heart,
  Share2,
  Send,
} from "lucide-react";
import { Button } from "./UI/button";
import { Textarea } from "./UI/textarea";
import { Card } from "./UI/card";
import { Input } from "./UI/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./UI/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./UI/select";
import { toast } from "sonner";
import { recoveryQuestions } from "../data/mental-health";

type PostComment = {
  id: number;
  text: string;
  author: string;
  createdAt: string;
};

type ConfessionPost = {
  id: number;
  text: string;
  createdAt: string;
  author: string;
  userId?: string;
  likes: number;
  likedBy: string[];
  comments: PostComment[];
  shares: number;
};

const POSTS_STORAGE_KEY = "confession_posts";
const TRANSLATION_CACHE_KEY = "confession_translation_cache";
const APP_LANG_TO_TRANSLATE_LANG: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  hi: "hi",
  zh: "zh-CN",
  ja: "ja",
  ar: "ar",
  ne: "ne",
};

export function ConfessionBox() {
  const [step, setStep] = useState<"pin" | "mode" | "confess" | "response" | "feed">("pin");
  const [pin, setPin] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [setupPinConfirm, setSetupPinConfirm] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState(recoveryQuestions[0]);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [showSharedPinNotice, setShowSharedPinNotice] = useState(false);
  const [resetPin, setResetPin] = useState("");
  const [resetPinConfirm, setResetPinConfirm] = useState("");
  const [mode, setMode] = useState<"ai" | "noai">("ai");
  const [confession, setConfession] = useState("");
  const [deleteOption, setDeleteOption] = useState("now");
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [posts, setPosts] = useState<ConfessionPost[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

  const {
    user,
    isAuthenticated,
    hasPrivateAccessConfigured,
    setupPrivateAccess,
    verifyPrivatePin,
    verifyPinRecoveryAnswer,
    resetPrivatePin,
  } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const videos = [
    "1P3ZgLOy-w8",
    "nS8Lim2OlK0",
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
    if (!savedPosts) {
      return;
    }

    try {
      setPosts(JSON.parse(savedPosts));
    } catch {
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    const savedCache = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (!savedCache) {
      return;
    }

    try {
      setTranslationCache(JSON.parse(savedCache));
    } catch {
      setTranslationCache({});
    }
  }, []);

  useEffect(() => {
    if (!user?.email || !hasPrivateAccessConfigured) {
      return;
    }
    const noticeKey = `shared_pin_notice_confess_${user.email}`;
    const seen = localStorage.getItem(noticeKey);
    if (!seen) {
      setShowSharedPinNotice(true);
    }
  }, [user?.email, hasPrivateAccessConfigured]);

  const handleInitialPrivateAccessSetup = async () => {
    if (setupPin.length !== 4 || setupPinConfirm.length !== 4) {
      toast.error("PIN must be 4 digits.");
      return;
    }

    if (setupPin !== setupPinConfirm) {
      toast.error("PINs do not match.");
      return;
    }

    if (!recoveryQuestion.trim() || !recoveryAnswer.trim()) {
      toast.error("Please set one recovery question and answer.");
      return;
    }

    await setupPrivateAccess(setupPin, recoveryQuestion, recoveryAnswer);
    toast.success("Private access setup complete.");
    setStep("mode");
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      toast.error(t("pinMustBe4Digits"));
      return;
    }

    const ok = await verifyPrivatePin(pin);
    if (!ok) {
      toast.error(t("incorrectPin"));
      setPin("");
      setFailedAttempts((count) => count + 1);
      return;
    }

    setFailedAttempts(0);
    setStep("mode");
  };

  const handlePinReset = async () => {
    if (!user?.pinRecoveryQuestion) {
      toast.error("Recovery question not available.");
      return;
    }

    if (resetPin.length !== 4 || resetPinConfirm.length !== 4) {
      toast.error("PIN must be 4 digits.");
      return;
    }

    if (resetPin !== resetPinConfirm) {
      toast.error("PINs do not match.");
      return;
    }

    const validAnswer = await verifyPinRecoveryAnswer(recoveryAnswer);
    if (!validAnswer) {
      toast.error("Recovery answer does not match.");
      return;
    }

    await resetPrivatePin(resetPin);
    toast.success("PIN reset successful. Use your new PIN.");
    setShowForgotPin(false);
    setRecoveryAnswer("");
    setResetPin("");
    setResetPinConfirm("");
    setPin("");
    setFailedAttempts(0);
  };

  const checkForCrisisWords = (text: string) => {
    const crisisKeywords = [
      "self-harm",
      "self harm",
      "kill myself",
      "suicide",
      "end my life",
      "want to die",
      "hurt myself",
    ];

    const lowerText = text.toLowerCase();
    return crisisKeywords.some((keyword) => lowerText.includes(keyword));
  };

  const persistPosts = (updatedPosts: ConfessionPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
  };

  const persistTranslationCache = (updatedCache: Record<string, string>) => {
    setTranslationCache(updatedCache);
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(updatedCache));
  };

  const translateText = async (text: string, targetLanguage: string) => {
    if (!text.trim() || targetLanguage === "en") {
      return text;
    }

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
        targetLanguage
      )}&dt=t&q=${encodeURIComponent(text)}`
    );

    if (!response.ok) {
      throw new Error("Translation request failed");
    }

    const data = await response.json();
    if (!Array.isArray(data?.[0])) {
      return text;
    }

    return data[0].map((chunk: any) => chunk[0] || "").join("");
  };

  useEffect(() => {
    if (posts.length === 0) {
      return;
    }

    const targetLanguage = APP_LANG_TO_TRANSLATE_LANG[language] || "en";
    if (targetLanguage === "en") {
      return;
    }

    const run = async () => {
      let nextCache = { ...translationCache };
      let changed = false;

      for (const post of posts) {
        const postKey = `${post.id}:${targetLanguage}:post`;
        if (!nextCache[postKey]) {
          try {
            const translated = await translateText(post.text, targetLanguage);
            nextCache[postKey] = translated;
            changed = true;
          } catch {
            nextCache[postKey] = post.text;
            changed = true;
          }
        }

        for (const comment of post.comments) {
          const commentKey = `${post.id}:${comment.id}:${targetLanguage}:comment`;
          if (nextCache[commentKey]) {
            continue;
          }

          try {
            const translatedComment = await translateText(comment.text, targetLanguage);
            nextCache[commentKey] = translatedComment;
            changed = true;
          } catch {
            nextCache[commentKey] = comment.text;
            changed = true;
          }
        }
      }

      if (changed) {
        persistTranslationCache(nextCache);
      }
    };

    run();
  }, [language, posts]);

  const getTranslatedPostText = (post: ConfessionPost) => {
    const targetLanguage = APP_LANG_TO_TRANSLATE_LANG[language] || "en";
    if (targetLanguage === "en") {
      return post.text;
    }

    return translationCache[`${post.id}:${targetLanguage}:post`] || post.text;
  };

  const getTranslatedCommentText = (postId: number, comment: PostComment) => {
    const targetLanguage = APP_LANG_TO_TRANSLATE_LANG[language] || "en";
    if (targetLanguage === "en") {
      return comment.text;
    }

    return (
      translationCache[`${postId}:${comment.id}:${targetLanguage}:comment`] || comment.text
    );
  };

  const createPostFromConfession = () => {
    if (!confession.trim()) {
      toast.error(t("pleaseWriteSomething"));
      return false;
    }

    if (checkForCrisisWords(confession)) {
      setShowCrisisResources(true);
      return false;
    }

    const newPost: ConfessionPost = {
      id: Date.now(),
      text: confession.trim(),
      createdAt: new Date().toISOString(),
      author: user?.nickname || t("anonymous"),
      userId: user?.email,
      likes: 0,
      likedBy: [],
      comments: [],
      shares: 0,
    };

    persistPosts([newPost, ...posts]);
    setConfession("");
    return true;
  };

  const handleSubmit = () => {
    if (!confession.trim()) {
      toast.error(t("pleaseWriteSomething"));
      return;
    }

    // Check for crisis keywords
    if (checkForCrisisWords(confession)) {
      setShowCrisisResources(true);
      return;
    }

    // Save confession with delete option
    const confessions = JSON.parse(localStorage.getItem("confessions") || "[]");
    const newConfession = {
      id: Date.now(),
      text: confession,
      mode,
      deleteOption,
      createdAt: new Date().toISOString(),
      userId: user?.email,
    };
    confessions.push(newConfession);
    localStorage.setItem("confessions", JSON.stringify(confessions));

    // Schedule deletion if needed
    if (deleteOption !== "never") {
      const deleteTime = {
        now: 0,
        "1hour": 3600000,
        "1week": 604800000,
        "1month": 2592000000,
      }[deleteOption];

      if (deleteTime === 0) {
        // Delete immediately after showing response
        setTimeout(() => {
          const updatedConfessions = confessions.filter(
            (c: any) => c.id !== newConfession.id
          );
          localStorage.setItem("confessions", JSON.stringify(updatedConfessions));
        }, 10000); // Delete after 10 seconds
      }
    }

    setShowVideo(true);
    setStep("response");
  };

  const handlePost = () => {
    const created = createPostFromConfession();
    if (!created) {
      return;
    }

    toast.success(t("postSharedSuccess"));
    setStep("feed");
  };

  const handleToggleLike = (postId: number) => {
    const actorId = user?.email || "guest";
    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) {
        return post;
      }

      const alreadyLiked = post.likedBy.includes(actorId);
      if (alreadyLiked) {
        return {
          ...post,
          likes: Math.max(0, post.likes - 1),
          likedBy: post.likedBy.filter((id) => id !== actorId),
        };
      }

      return {
        ...post,
        likes: post.likes + 1,
        likedBy: [...post.likedBy, actorId],
      };
    });

    persistPosts(updatedPosts);
  };

  const handleAddComment = (postId: number) => {
    const commentText = (commentDrafts[postId] || "").trim();
    if (!commentText) {
      return;
    }

    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) {
        return post;
      }

      const newComment: PostComment = {
        id: Date.now(),
        text: commentText,
        author: user?.nickname || t("anonymous"),
        createdAt: new Date().toISOString(),
      };

      return {
        ...post,
        comments: [...post.comments, newComment],
      };
    });

    persistPosts(updatedPosts);
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleShare = async (postId: number, text: string) => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }

    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, shares: post.shares + 1 } : post
    );

    persistPosts(updatedPosts);
    toast.success(t("postCopiedToClipboard"));
  };

  const handleVideoError = () => {
    // Show next video or fallback to letter
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setShowVideo(false);
    }
  };

  if (showCrisisResources) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <AlertCircle className="size-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl mb-4">{t("crisisMessage")}</h2>
            <p className="text-gray-700 mb-6">
              {t("youAreNotAloneReachOut")}
            </p>
            <Button
              onClick={() => navigate("/emergency")}
              className="bg-red-500 hover:bg-red-600"
            >
              {t("viewEmergencyResources")}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl mb-3">{t("confessTitle")}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t("confessSubtitle")}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "pin" && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="p-8">
              <div className="text-center mb-6">
                <Lock className="size-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl mb-2">
                  {hasPrivateAccessConfigured ? t("enterPin") : "Set Up Your Private Access"}
                </h3>
                <p className="text-sm text-gray-600">
                  {hasPrivateAccessConfigured
                    ? "Use your shared PIN to unlock the confession box."
                    : "Set one PIN for both Journal and Confession Box, plus a recovery question."}
                </p>
              </div>

              {!hasPrivateAccessConfigured ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Choose 4-digit PIN</p>
                    <div className="flex justify-center">
                      <InputOTP maxLength={4} value={setupPin} onChange={setSetupPin}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Confirm PIN</p>
                    <div className="flex justify-center">
                      <InputOTP maxLength={4} value={setupPinConfirm} onChange={setSetupPinConfirm}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Choose recovery question</p>
                    <Select value={recoveryQuestion} onValueChange={setRecoveryQuestion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recoveryQuestions.map((question) => (
                          <SelectItem key={question} value={question}>
                            {question}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Recovery answer"
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                  />
                  <Button onClick={handleInitialPrivateAccessSetup} className="w-full">
                    Save and Continue
                  </Button>
                </div>
              ) : showForgotPin ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Recovery Question:</span>{" "}
                    {user?.pinRecoveryQuestion}
                  </p>
                  <Input
                    placeholder="Your recovery answer"
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                  />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">New 4-digit PIN</p>
                    <div className="flex justify-center">
                      <InputOTP maxLength={4} value={resetPin} onChange={setResetPin}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Confirm new PIN</p>
                    <div className="flex justify-center">
                      <InputOTP maxLength={4} value={resetPinConfirm} onChange={setResetPinConfirm}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <Button onClick={handlePinReset} className="w-full">
                    Reset PIN
                  </Button>
                  <Button variant="outline" onClick={() => setShowForgotPin(false)} className="w-full">
                    Back to PIN
                  </Button>
                </div>
              ) : (
                <>
                  {showSharedPinNotice && (
                    <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
                      <p>
                        The PIN for Confession and Journal is the same. You do not need to create a second PIN.
                      </p>
                      <Button
                        variant="ghost"
                        className="h-auto px-0 py-1 text-purple-700"
                        onClick={() => {
                          if (user?.email) {
                            localStorage.setItem(`shared_pin_notice_confess_${user.email}`, "1");
                          }
                          setShowSharedPinNotice(false);
                        }}
                      >
                        Got it
                      </Button>
                    </div>
                  )}
                  <div className="flex justify-center mb-6">
                    <InputOTP maxLength={4} value={pin} onChange={setPin}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button onClick={handlePinSubmit} className="w-full">
                    {t("unlock")}
                  </Button>
                  {failedAttempts > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowForgotPin(true)}
                      className="w-full mt-3"
                    >
                      Forgot PIN?
                    </Button>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        )}

        {step === "mode" && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="p-8">
              <h3 className="text-2xl mb-6 text-center">{t("chooseYourMode")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMode("ai");
                    setStep("confess");
                  }}
                  className={`p-6 rounded-xl cursor-pointer border-2 ${
                    mode === "ai"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 dark:border-purple-700"
                      : "border-gray-200 dark:border-slate-700"
                  }`}
                >
                  <Sparkles className="size-10 text-purple-500 mb-3" />
                  <h4 className="text-lg mb-2">{t("withAI")}</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    {t("withAIDesc")}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMode("noai");
                    setStep("confess");
                  }}
                  className={`p-6 rounded-xl cursor-pointer border-2 ${
                    mode === "noai"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-700"
                      : "border-gray-200 dark:border-slate-700"
                  }`}
                >
                  <MessageSquare className="size-10 text-blue-500 mb-3" />
                  <h4 className="text-lg mb-2">{t("withoutAI")}</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    {t("withoutAIDesc")}
                  </p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "confess" && (
          <motion.div
            key="confess"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="p-8">
              <Textarea
                placeholder={t("enterConfession")}
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                className="min-h-64 mb-4"
              />

              <div className="mb-4">
                <label className="block text-sm mb-2">{t("deleteOption")}</label>
                <Select value={deleteOption} onValueChange={setDeleteOption}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">{t("deleteNow")}</SelectItem>
                    <SelectItem value="1hour">{t("deleteAfter1Hour")}</SelectItem>
                    <SelectItem value="1week">{t("deleteAfter1Week")}</SelectItem>
                    <SelectItem value="1month">{t("deleteAfter1Month")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("mode")}>
                  {t("back")}
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {t("submit")}
                </Button>
                <Button onClick={handlePost} className="flex-1">
                  {t("post")}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "feed" && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl">{t("communityStatus")}</h3>
                <Button
                  variant="outline"
                  onClick={() => setStep("confess")}
                >
                  {t("newConfession")}
                </Button>
              </div>

              <div className="space-y-4">
                {posts.length === 0 && (
                  <p className="text-gray-600 dark:text-slate-300">{t("noPostsYet")}</p>
                )}

                {posts.map((post) => {
                  const isLiked = post.likedBy.includes(user?.email || "guest");

                  return (
                    <Card key={post.id} className="p-4 border border-gray-200 dark:border-slate-700">
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {post.author} . {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <p className="text-gray-800 dark:text-slate-100 mb-4">{getTranslatedPostText(post)}</p>

                      <div className="flex gap-2 mb-4">
                        <Button
                          variant={isLiked ? "default" : "outline"}
                          onClick={() => handleToggleLike(post.id)}
                        >
                          <Heart className="size-4 mr-2" />
                          {t("like")} ({post.likes})
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAddComment(post.id)}
                        >
                          <MessageSquare className="size-4 mr-2" />
                          {t("comment")} ({post.comments.length})
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare(post.id, post.text)}
                        >
                          <Share2 className="size-4 mr-2" />
                          {t("share")} ({post.shares})
                        </Button>
                      </div>

                      <div className="flex gap-2 mb-3">
                        <Textarea
                          placeholder={t("writeComment")}
                          value={commentDrafts[post.id] || ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          className="min-h-16"
                        />
                        <Button
                          onClick={() => handleAddComment(post.id)}
                          className="self-end"
                        >
                          <Send className="size-4" />
                        </Button>
                      </div>

                      {post.comments.length > 0 && (
                        <div className="space-y-2">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                                {comment.author}
                              </p>
                              <p className="text-sm text-gray-700 dark:text-slate-200">
                                {getTranslatedCommentText(post.id, comment)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {step === "response" && (
          <motion.div
            key="response"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {showVideo ? (
              <Card className="p-8 mb-6">
                <h3 className="text-xl mb-4 text-center">{t("heresSomethingForYou")}</h3>
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videos[currentVideoIndex]}`}
                    title="Uplifting Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={handleVideoError}
                  ></iframe>
                </div>
              </Card>
            ) : (
              <Card className="p-8 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
                <h3 className="text-2xl mb-4 text-center">{t("letterFromFriendTitle")}</h3>
                <div className="prose prose-lg">
                  <p className="text-gray-700 dark:text-slate-200 leading-relaxed">
                    {t("dearFriend")}
                  </p>
                  <p className="text-gray-700 dark:text-slate-200 leading-relaxed">
                    {t("friendLetterPara1")}
                  </p>
                  <p className="text-gray-700 dark:text-slate-200 leading-relaxed">
                    {t("friendLetterPara2")}
                  </p>
                  <p className="text-gray-700 dark:text-slate-200 leading-relaxed">
                    {t("friendLetterPara3")}
                  </p>
                  <p className="text-gray-700 dark:text-slate-200 leading-relaxed">
                    {t("friendLetterSignature")}
                  </p>
                </div>
              </Card>
            )}

            {mode === "ai" && (
              <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-slate-800 dark:to-slate-700 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium mb-2">{t("aiSupportMessage")}</h4>
                    <p className="text-gray-700 dark:text-slate-200">{t("aiResponse")}</p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex gap-3">
              <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                {t("goHome")}
              </Button>
              <Button
                onClick={() => {
                  setStep("mode");
                  setConfession("");
                  setShowVideo(false);
                  setCurrentVideoIndex(0);
                }}
                className="flex-1"
              >
                {t("newConfession")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
