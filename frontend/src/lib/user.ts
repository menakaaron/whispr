import { createUser } from "./api";

const USER_ID_KEY = "whisprai_user_id";

// Default user profile — update these or build a settings form later
const DEFAULT_PROFILE = {
  email: "user@whisprai.app",
  nativeLanguage: "English",
  targetLanguage: "Mandarin",
  proficiencyLevel: "beginner",
  learningGoals: ["improve pronunciation", "build confidence"],
};

/**
 * Returns the current userId from localStorage, or creates a new user
 * on the backend and saves the userId locally.
 */
export async function getOrCreateUserId(): Promise<string> {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  try {
    const { userId } = await createUser(DEFAULT_PROFILE);
    window.localStorage.setItem(USER_ID_KEY, userId);
    return userId;
  } catch (err) {
    console.error("Failed to create user:", err);
    // Fallback: generate a local ID so the app still works
    const fallback = crypto.randomUUID();
    window.localStorage.setItem(USER_ID_KEY, fallback);
    return fallback;
  }
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_ID_KEY);
}
