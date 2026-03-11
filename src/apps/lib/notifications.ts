type ThemeMode = "light" | "dark";

type UserSettings = {
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  profileVisible?: boolean;
  theme?: ThemeMode;
  notifyOnLikes?: boolean;
  notifyOnComments?: boolean;
  notifyOnLetters?: boolean;
};

type AccountRecord = {
  email: string;
  nickname: string;
  settings?: UserSettings;
};

export type AppNotificationType = "like" | "comment" | "letter";

export type AppNotification = {
  id: string;
  userId: string;
  type: AppNotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actorId?: string;
  actorName?: string;
  entityId?: string;
};

const ACCOUNT_STORAGE_KEY = "staywithme_accounts";
const NOTIFICATIONS_STORAGE_KEY = "staywithme_notifications";

function readAccounts(): AccountRecord[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function readNotifications(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeNotifications(notifications: AppNotification[]) {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
}

function userAllowsNotification(recipientId: string, type: AppNotificationType) {
  const account = readAccounts().find((item) => item.email === recipientId);
  if (!account) {
    return false;
  }

  const settings = account.settings || {};
  if (settings.notificationsEnabled === false) {
    return false;
  }

  if (type === "like" && settings.notifyOnLikes === false) {
    return false;
  }

  if (type === "comment" && settings.notifyOnComments === false) {
    return false;
  }

  if (type === "letter" && settings.notifyOnLetters === false) {
    return false;
  }

  return true;
}

export function pushNotification(
  notification: Omit<AppNotification, "id" | "createdAt" | "read">
) {
  if (!notification.userId || !userAllowsNotification(notification.userId, notification.type)) {
    return;
  }

  const nextNotification: AppNotification = {
    ...notification,
    id: `${notification.type}-${notification.userId}-${notification.entityId || Date.now()}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  writeNotifications([nextNotification, ...readNotifications()]);
}

export function markAllNotificationsRead(userId: string) {
  const updated = readNotifications().map((item) =>
    item.userId === userId ? { ...item, read: true } : item
  );
  writeNotifications(updated);
}

export function pushLikeNotification(payload: {
  recipientId?: string;
  actorId?: string;
  actorName: string;
  postId: number;
}) {
  if (!payload.recipientId || !payload.actorId || payload.recipientId === payload.actorId) {
    return;
  }

  pushNotification({
    userId: payload.recipientId,
    type: "like",
    title: "Someone liked your post",
    message: `${payload.actorName} liked one of your confessions.`,
    actorId: payload.actorId,
    actorName: payload.actorName,
    entityId: String(payload.postId),
  });
}

export function pushCommentNotification(payload: {
  recipientId?: string;
  actorId?: string;
  actorName: string;
  postId: number;
  commentText: string;
}) {
  if (!payload.recipientId || !payload.actorId || payload.recipientId === payload.actorId) {
    return;
  }

  pushNotification({
    userId: payload.recipientId,
    type: "comment",
    title: "Someone commented on your post",
    message: `${payload.actorName} commented: "${payload.commentText.slice(0, 80)}${payload.commentText.length > 80 ? "..." : ""}"`,
    actorId: payload.actorId,
    actorName: payload.actorName,
    entityId: String(payload.postId),
  });
}

export function pushLetterNotifications(payload: {
  actorId?: string;
  actorName: string;
  letterId: number;
}) {
  if (!payload.actorId) {
    return;
  }

  const recipients = readAccounts()
    .filter((account) => account.email !== payload.actorId)
    .map((account) => account.email);

  recipients.forEach((recipientId) => {
    pushNotification({
      userId: recipientId,
      type: "letter",
      title: "A new letter is waiting",
      message: `${payload.actorName} shared a new supportive letter with the community.`,
      actorId: payload.actorId,
      actorName: payload.actorName,
      entityId: String(payload.letterId),
    });
  });
}
