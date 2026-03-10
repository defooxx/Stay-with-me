import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Card } from "./UI/card";
import { Button } from "./UI/button";
import { Input } from "./UI/input";
import { Switch } from "./UI/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./UI/tabs";
import { toast } from "sonner";

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

const ACTIVITY_STORAGE_KEY = "staywithme_activities";

export function SettingsPage() {
  const {
    user,
    isAuthenticated,
    logout,
    updateUserSettings,
    updateProfile,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setNickname(user?.nickname || "");
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

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

    const merged = [...confessionPosts, ...journalPosts, ...letters].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setPosts(merged);

    const savedActivities = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]")
      .filter((activity: UserActivity) => activity.userId === user.email)
      .sort((a: UserActivity, b: UserActivity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setActivities(savedActivities);
  }, [user]);

  const settings = useMemo(
    () => user?.settings,
    [user]
  );
  const activeTab = searchParams.get("tab") || "profile";

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl mb-2">Settings</h1>
        <p className="text-gray-600">Manage profile, notifications, privacy, account, and app theme.</p>
      </motion.div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setSearchParams({ tab: value })}
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Nickname" />
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), nickname: nickname.trim() });
                toast.success("Profile updated.");
              }}
            >
              <Button type="submit">
                Save Profile
              </Button>
            </form>

            <div className="pt-4 border-t">
              <h3 className="text-xl mb-3">Your Posts</h3>
              <div className="space-y-3">
                {posts.length === 0 && (
                  <p className="text-gray-600">No posts yet.</p>
                )}
                {posts.map((post) => (
                  <Card key={`${post.source}-${post.id}`} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{post.source}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.text}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-xl mb-3">Activities</h3>
              <div className="space-y-3">
                {activities.length === 0 && (
                  <p className="text-gray-600">No activities yet.</p>
                )}
                {activities.map((activity) => (
                  <Card key={`activity-${activity.id}`} className="p-4">
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.category}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.detail}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6 space-y-5">
            <h2 className="text-2xl">Notifications</h2>
            <div className="flex items-center justify-between">
              <p>Enable in-app notifications</p>
              <Switch
                checked={settings?.notificationsEnabled || false}
                onCheckedChange={(checked) => updateUserSettings({ notificationsEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <p>Enable email notifications</p>
              <Switch
                checked={settings?.emailNotifications || false}
                onCheckedChange={(checked) => updateUserSettings({ emailNotifications: checked })}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6 space-y-5">
            <h2 className="text-2xl">Privacy Settings</h2>
            <div className="flex items-center justify-between">
              <p>Show profile to others</p>
              <Switch
                checked={settings?.profileVisible || false}
                onCheckedChange={(checked) => updateUserSettings({ profileVisible: checked })}
              />
            </div>
            <p className="text-sm text-gray-600">
              Your journal and confession content remains private to your account unless you choose to post publicly.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl">Account Settings</h2>
            <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
            <p className="text-gray-700"><span className="font-medium">Region:</span> {user.countryName}</p>
            <p className="text-gray-700"><span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-700"><span className="font-medium">Last Login:</span> {new Date(user.lastLoginAt).toLocaleString()}</p>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log Out
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-6 space-y-5">
            <h2 className="text-2xl">Appearance</h2>
            <div className="flex items-center justify-between">
              <p>Dark mode</p>
              <Switch
                checked={settings?.theme === "dark"}
                onCheckedChange={(checked) =>
                  updateUserSettings({ theme: checked ? "dark" : "light" })
                }
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
