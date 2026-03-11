import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import {
  Activity,
  Bell,
  CheckCircle2,
  Droplets,
  Heart,
  LogOut,
  Mail,
  MessageCircle,
  MoonStar,
  Shield,
  Sparkles,
  Sunrise,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { recoveryQuestions } from "../data/mental-health";
import { markAllNotificationsRead, readNotifications, type AppNotification } from "../lib/notifications";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./UI/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./UI/accordion";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./UI/dialog";
import { Input } from "./UI/input";
import { Switch } from "./UI/switch";

type UserPost = {
  id: number;
  source: "Confession" | "Journal" | "Letter";
  text: string;
  createdAt: string;
};

type UserActivity = {
  id: number;
  userId: string;
  category: string;
  title: string;
  detail: string;
  createdAt: string;
};

type ProfileDraft = {
  firstName: string;
  lastName: string;
  nickname: string;
};

type SettingsSection = "you" | "space" | "activity" | "updates" | "account";

const ACTIVITY_STORAGE_KEY = "staywithme_activities";

const sectionItems: Array<{
  value: SettingsSection;
  label: string;
  description: string;
  icon: typeof UserRound;
}> = [
  { value: "you", label: "You", description: "Profile and post history", icon: UserRound },
  { value: "space", label: "Your space", description: "Privacy, theme, and preferences", icon: Sparkles },
  { value: "activity", label: "Your activity", description: "Grouped care activity", icon: Activity },
  { value: "updates", label: "Updates", description: "Notification inbox", icon: Bell },
  { value: "account", label: "Account", description: "Session and account details", icon: Mail },
];

const activitySections = [
  { key: "water", label: "Water", icon: Droplets, match: ["water"] },
  { key: "sunlight", label: "Sunlight", icon: Sunrise, match: ["sunlight", "light"] },
  { key: "focus", label: "Focus", icon: Activity, match: ["focus", "task"] },
  { key: "breathing", label: "Breathing", icon: Sparkles, match: ["breathing", "breathe", "breath"] },
  { key: "grounding", label: "Grounding", icon: Sparkles, match: ["grounding"] },
  { key: "other", label: "Other", icon: Activity, match: [] },
] as const;

function getActivitySectionKey(activity: UserActivity) {
  const haystack = `${activity.category} ${activity.title} ${activity.detail}`.toLowerCase();
  const matched = activitySections.find(
    (section) => section.key !== "other" && section.match.some((term) => haystack.includes(term))
  );
  return matched?.key || "other";
}

function getNotificationIcon(type: AppNotification["type"]) {
  if (type === "like") {
    return Heart;
  }
  if (type === "comment") {
    return MessageCircle;
  }
  return Mail;
}

function getNotificationAccent(type: AppNotification["type"]) {
  if (type === "like") {
    return "text-pink-600 bg-pink-50 border-pink-100 dark:text-pink-300 dark:bg-pink-950/20 dark:border-pink-900/40";
  }
  if (type === "comment") {
    return "text-sky-600 bg-sky-50 border-sky-100 dark:text-sky-300 dark:bg-sky-950/20 dark:border-sky-900/40";
  }
  return "text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40";
}

export function SettingsPage() {
  const {
    user,
    isAuthenticated,
    logout,
    updateUserSettings,
    updateProfile,
    setupPrivateAccess,
    verifyPinRecoveryAnswer,
    resetPrivatePin,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({
    firstName: "",
    lastName: "",
    nickname: "",
  });
  const [setupPin, setSetupPin] = useState("");
  const [setupPinConfirm, setSetupPinConfirm] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState(recoveryQuestions[0]);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [manageAnswer, setManageAnswer] = useState("");
  const [showPinManager, setShowPinManager] = useState(false);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileDraft({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      nickname: user.nickname || "",
    });

    const confessionPosts = JSON.parse(localStorage.getItem("confession_posts") || "[]")
      .filter((post: any) => post.userId === user.email || post.author === user.nickname)
      .map((post: any) => ({
        id: post.id,
        source: "Confession" as const,
        text: post.text,
        createdAt: post.createdAt,
      }));

    const journalPosts = JSON.parse(localStorage.getItem("journalEntries") || "[]")
      .filter((entry: any) => entry.userId === user.email)
      .map((entry: any) => ({
        id: entry.id,
        source: "Journal" as const,
        text: entry.text,
        createdAt: entry.createdAt,
      }));

    const letters = JSON.parse(localStorage.getItem("communityLetters") || "[]")
      .filter((letter: any) => letter.authorEmail === user.email || letter.authorNickname === user.nickname)
      .map((letter: any) => ({
        id: letter.id,
        source: "Letter" as const,
        text: letter.text,
        createdAt: letter.createdAt,
      }));

    setPosts(
      [...confessionPosts, ...journalPosts, ...letters].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );

    setActivities(
      JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]")
        .filter((activity: UserActivity) => activity.userId === user.email)
        .sort(
          (a: UserActivity, b: UserActivity) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    );

    setNotifications(
      readNotifications()
        .filter((notification) => notification.userId === user.email)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }, [user]);

  const activeSection = (searchParams.get("tab") as SettingsSection) || "you";
  const settings = user?.settings;
  const unreadNotifications = notifications.filter((item) => !item.read).length;
  const profileIsDirty =
    profileDraft.firstName.trim() !== (user?.firstName || "") ||
    profileDraft.lastName.trim() !== (user?.lastName || "") ||
    profileDraft.nickname.trim() !== (user?.nickname || "");

  const groupedActivities = useMemo(() => {
    return activitySections
      .map((section) => ({
        ...section,
        items: activities.filter((activity) => getActivitySectionKey(activity) === section.key),
      }))
      .filter((section) => section.items.length > 0);
  }, [activities]);

  if (!user) {
    return null;
  }

  const setActiveSection = (value: SettingsSection) => setSearchParams({ tab: value });

  const handleSaveProfile = () => {
    if (!profileIsDirty) {
      return;
    }

    updateProfile({
      firstName: profileDraft.firstName.trim(),
      lastName: profileDraft.lastName.trim(),
      nickname: profileDraft.nickname.trim(),
    });
    toast.success("Profile saved.");
  };

  const handleMarkAllNotificationsRead = () => {
    markAllNotificationsRead(user.email);
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const handleSetupPin = async () => {
    if (setupPin.length !== 4 || setupPinConfirm.length !== 4) {
      toast.error("PIN must be 4 digits.");
      return false;
    }

    if (setupPin !== setupPinConfirm) {
      toast.error("PINs do not match.");
      return false;
    }

    if (!recoveryQuestion.trim() || !recoveryAnswer.trim()) {
      toast.error("Please set one recovery question and answer.");
      return false;
    }

    await setupPrivateAccess(setupPin, recoveryQuestion, recoveryAnswer);
    setSetupPin("");
    setSetupPinConfirm("");
    setRecoveryAnswer("");
    toast.success("Private PIN set.");
    return true;
  };

  const handleChangePin = async () => {
    if (newPin.length !== 4 || newPinConfirm.length !== 4) {
      toast.error("PIN must be 4 digits.");
      return false;
    }

    if (newPin !== newPinConfirm) {
      toast.error("PINs do not match.");
      return false;
    }

    if (!manageAnswer.trim()) {
      toast.error("Enter your recovery answer.");
      return false;
    }

    const validAnswer = await verifyPinRecoveryAnswer(manageAnswer);
    if (!validAnswer) {
      toast.error("Recovery answer does not match.");
      return false;
    }

    await resetPrivatePin(newPin);
    setManageAnswer("");
    setNewPin("");
    setNewPinConfirm("");
    toast.success("PIN updated.");
    return true;
  };

  return (
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="rounded-[1.75rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-rose-500 dark:text-rose-300">Settings</p>
              <h1 className="mt-2 text-3xl font-semibold">Quiet, clear settings</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Organized around what you want to do: update yourself, tune your space, review activity, read updates, and manage your account.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
              <span>{posts.length} posts</span>
              <span>{activities.length} activities</span>
              <span>{unreadNotifications} unread</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="self-start lg:sticky lg:top-24">
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveSection(item.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <Card className="hidden gap-1 border-slate-200 bg-white/85 p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 lg:flex">
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveSection(item.value)}
                  className={`rounded-[1.1rem] px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-2xl p-2 ${isActive ? "bg-white/15 dark:bg-slate-200" : "bg-slate-100 dark:bg-slate-800"}`}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className={`mt-0.5 text-xs leading-5 ${isActive ? "text-white/80 dark:text-slate-700" : "text-slate-500 dark:text-slate-400"}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </Card>
        </aside>

        <div className="min-w-0">
          {activeSection === "you" && (
            <div className="space-y-6">
              <Card className="gap-0 overflow-hidden border-slate-200 bg-white/85 p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="border-b border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                  <h2 className="text-2xl font-semibold">You</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Update your profile and keep your shared identity tidy.
                  </p>
                </div>
                <div className="grid gap-6 p-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input
                        value={profileDraft.firstName}
                        onChange={(event) =>
                          setProfileDraft((current) => ({ ...current, firstName: event.target.value }))
                        }
                        placeholder="First name"
                      />
                      <Input
                        value={profileDraft.lastName}
                        onChange={(event) =>
                          setProfileDraft((current) => ({ ...current, lastName: event.target.value }))
                        }
                        placeholder="Last name"
                      />
                      <Input
                        value={profileDraft.nickname}
                        onChange={(event) =>
                          setProfileDraft((current) => ({ ...current, nickname: event.target.value }))
                        }
                        placeholder="Nickname"
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button onClick={handleSaveProfile} disabled={!profileIsDirty} className="rounded-full">
                        {profileIsDirty ? "Save profile" : "Saved"}
                      </Button>
                      {!profileIsDirty && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                          <CheckCircle2 className="size-4" />
                          Profile is up to date
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Email</p>
                      <p className="mt-2 text-sm font-medium">{user.email}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Region</p>
                      <p className="mt-2 text-sm font-medium">{user.countryName}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Joined</p>
                      <p className="mt-2 text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Nickname</p>
                      <p className="mt-2 text-sm font-medium">{user.nickname}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="gap-0 overflow-hidden border-slate-200 bg-white/85 p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="border-b border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                  <h2 className="text-2xl font-semibold">Your posts</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    A simple record of what you have shared.
                  </p>
                </div>
                <div className="p-6">
                  {posts.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">No posts yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <div
                          key={`${post.source}-${post.id}`}
                          className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {post.source}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(post.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                            {post.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeSection === "space" && (
            <div className="space-y-6">
              <Card className="gap-0 overflow-hidden border-slate-200 bg-white/85 p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="border-b border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                  <h2 className="text-2xl font-semibold">Your space</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Control the tone, visibility, and notification behavior of the app around you.
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-8">
                    <section>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                          <Shield className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">Privacy</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Keep your profile visible only if you want it visible.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-b border-slate-200 py-3 dark:border-slate-800">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Show profile to others</span>
                        <Switch
                          checked={settings?.profileVisible || false}
                          onCheckedChange={(checked) => updateUserSettings({ profileVisible: checked })}
                        />
                      </div>
                      <div className="flex items-start justify-between gap-4 py-4">
                        <div>
                          <p className="text-sm font-medium">Private PIN protection</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Protect private areas like your journal and confession access with a 4-digit PIN.
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Used for private journal and confession access.
                          </p>
                        </div>
                        <Button
                          variant={showPinManager ? "default" : "outline"}
                          className="rounded-full"
                          onClick={() => setShowPinManager((current) => !current)}
                        >
                          Manage PIN
                        </Button>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                          <MoonStar className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">Appearance</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Switch the app theme without touching anything else.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-b border-slate-200 py-3 dark:border-slate-800">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Dark mode</span>
                        <Switch
                          checked={settings?.theme === "dark"}
                          onCheckedChange={(checked) => updateUserSettings({ theme: checked ? "dark" : "light" })}
                        />
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                          <Bell className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">Notification preferences</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Decide which updates should show up in your inbox.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">Enable in-app notifications</span>
                          <Switch
                            checked={settings?.notificationsEnabled || false}
                            onCheckedChange={(checked) => updateUserSettings({ notificationsEnabled: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">Email notifications</span>
                          <Switch
                            checked={settings?.emailNotifications || false}
                            onCheckedChange={(checked) => updateUserSettings({ emailNotifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">Likes on your posts</span>
                          <Switch
                            checked={settings?.notifyOnLikes || false}
                            onCheckedChange={(checked) => updateUserSettings({ notifyOnLikes: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">Comments on your posts</span>
                          <Switch
                            checked={settings?.notifyOnComments || false}
                            onCheckedChange={(checked) => updateUserSettings({ notifyOnComments: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-300">New letters from the community</span>
                          <Switch
                            checked={settings?.notifyOnLetters || false}
                            onCheckedChange={(checked) => updateUserSettings({ notifyOnLetters: checked })}
                          />
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </Card>

              <Dialog open={showPinManager} onOpenChange={setShowPinManager}>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Manage PIN</DialogTitle>
                    <DialogDescription>
                      {user.privatePinHash
                        ? "Change your private PIN using your recovery answer."
                        : "Set up a 4-digit PIN to protect private journal and confession access."}
                    </DialogDescription>
                  </DialogHeader>

                  {!user.privatePinHash ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          value={setupPin}
                          onChange={(event) => setSetupPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="New 4-digit PIN"
                        />
                        <Input
                          value={setupPinConfirm}
                          onChange={(event) => setSetupPinConfirm(event.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="Confirm 4-digit PIN"
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                        <Select value={recoveryQuestion} onValueChange={setRecoveryQuestion}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a recovery question" />
                          </SelectTrigger>
                          <SelectContent>
                            {recoveryQuestions.map((question) => (
                              <SelectItem key={question} value={question}>
                                {question}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={recoveryAnswer}
                          onChange={(event) => setRecoveryAnswer(event.target.value)}
                          placeholder="Recovery answer"
                        />
                      </div>
                      <Button
                        className="rounded-full"
                        onClick={async () => {
                          const success = await handleSetupPin();
                          if (success) {
                            setShowPinManager(false);
                          }
                        }}
                      >
                        Set up PIN
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                        <p className="font-medium text-slate-900 dark:text-white">Recovery question</p>
                        <p className="mt-1">{user.pinRecoveryQuestion || "No recovery question found."}</p>
                      </div>
                      <div className="grid gap-3">
                        <Input
                          value={manageAnswer}
                          onChange={(event) => setManageAnswer(event.target.value)}
                          placeholder="Recovery answer"
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            value={newPin}
                            onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="New 4-digit PIN"
                          />
                          <Input
                            value={newPinConfirm}
                            onChange={(event) => setNewPinConfirm(event.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="Confirm new PIN"
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={async () => {
                          const success = await handleChangePin();
                          if (success) {
                            setShowPinManager(false);
                          }
                        }}
                      >
                        Change PIN
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeSection === "activity" && (
            <Card className="gap-0 overflow-hidden border-slate-200 bg-white/85 p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="border-b border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                <h2 className="text-2xl font-semibold">Your activity</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Grouped by topic, so each type of care stays in its own lane.
                </p>
              </div>
              <div className="p-6">
                {groupedActivities.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">No activities yet.</p>
                ) : (
                  <Accordion type="multiple" className="space-y-3">
                    {groupedActivities.map((section) => {
                      const Icon = section.icon;
                      return (
                        <AccordionItem
                          key={section.key}
                          value={section.key}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 px-4 dark:border-slate-800 dark:bg-slate-900/70"
                        >
                          <AccordionTrigger className="py-4 hover:no-underline">
                            <div className="flex items-center gap-3">
                              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                                <Icon className="size-5 text-slate-700 dark:text-slate-200" />
                              </div>
                              <div className="text-left">
                                <h3 className="text-base font-semibold">{section.label}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {section.items.length} related {section.items.length === 1 ? "entry" : "entries"}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                              {section.items.map((activity) => (
                                <div
                                  key={`activity-${activity.id}`}
                                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/30"
                                >
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <p className="font-medium">{activity.title}</p>
                                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                        {activity.detail}
                                      </p>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {new Date(activity.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </div>
            </Card>
          )}

          {activeSection === "updates" && (
            <div className="space-y-6">
              <Card className="gap-0 overflow-hidden border-slate-200 bg-white/85 p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Updates</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Likes, comments, and new letters show up here.
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={handleMarkAllNotificationsRead}>
                    Mark all as read
                  </Button>
                </div>
                <div className="p-6">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">No updates yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        return (
                          <div
                            key={notification.id}
                            className={`rounded-2xl border p-4 ${getNotificationAccent(notification.type)} ${
                              notification.read ? "opacity-70" : ""
                            }`}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex gap-3">
                                <div className="rounded-2xl bg-white/80 p-3 dark:bg-slate-900/60">
                                  <Icon className="size-5" />
                                </div>
                                <div>
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="mt-1 text-sm leading-6">{notification.message}</p>
                                </div>
                              </div>
                              <span className="text-xs">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeSection === "account" && (
            <div className="space-y-6">
              <Card className="gap-0 overflow-hidden border-slate-200 bg-white/85 p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="border-b border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/70">
                  <h2 className="text-2xl font-semibold">Account</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Administrative details and session actions live here, separate from everything else.
                  </p>
                </div>
                <div className="grid gap-6 p-6 xl:grid-cols-[1fr_0.82fr]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Email</p>
                      <p className="mt-2 font-medium">{user.email}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Nickname</p>
                      <p className="mt-2 font-medium">{user.nickname}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Joined</p>
                      <p className="mt-2 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Last login</p>
                      <p className="mt-2 font-medium">{new Date(user.lastLoginAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-lg font-semibold">Session</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Log out from here when you are done. This only ends the current session.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-5 w-full justify-center rounded-full"
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                    >
                      <LogOut className="mr-2 size-4" />
                      Log out
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
