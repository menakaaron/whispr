const WHISPR_API = process.env.NEXT_PUBLIC_API_URL!;
const WHISPRAI_API = process.env.NEXT_PUBLIC_WHISPRAI_API_URL!;

// ── Users ──────────────────────────────────────────────────────────────────

export async function createUser(data: {
  email: string;
  nativeLanguage: string;
  targetLanguage: string;
  proficiencyLevel: string;
  learningGoals: string[];
}): Promise<{ userId: string }> {
  const res = await fetch(`${WHISPR_API}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function getUser(userId: string) {
  const res = await fetch(`${WHISPR_API}/users/${userId}`);
  if (!res.ok) throw new Error("Failed to get user");
  return res.json();
}

// ── Conversations ──────────────────────────────────────────────────────────

export async function processConversation(data: {
  userId: string;
  audioKey: string;
}): Promise<{
  conversationId: string;
  status: string;
  transcript: string;
  feedback: {
    pronunciation: string;
    fluency: string;
    culturalContext: string;
  };
}> {
  const res = await fetch(`${WHISPRAI_API}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to process conversation");
  return res.json();
}

// ── Feedback ───────────────────────────────────────────────────────────────

export async function saveFeedback(data: {
  conversationId: string;
  feedbackType: string;
  insights?: string[];
  suggestions?: string[];
  severity?: string;
  generatedBy?: string;
}) {
  const res = await fetch(`${WHISPR_API}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save feedback");
  return res.json();
}

// ── Progress ───────────────────────────────────────────────────────────────

export async function getProgress(userId: string) {
  const res = await fetch(`${WHISPR_API}/progress/${userId}`);
  if (!res.ok) throw new Error("Failed to get progress");
  return res.json();
}
