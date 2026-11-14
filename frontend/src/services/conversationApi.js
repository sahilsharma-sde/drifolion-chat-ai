import { API_BASE_URL, authFetch } from "./authApi";

export const getConversations = async () => {
  const response = await authFetch(`${API_BASE_URL}/api/conversations`);

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || "Failed to load conversations");

  return data.conversations;
};

export const createConversation = async (title) => {
  const response = await authFetch(`${API_BASE_URL}/api/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
    }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || "Failed to create conversation");

  return data.conversation;
};

export const getMessages = async (conversationId) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
  );

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || "Failed to load messages");

  return data.messages;
};

export function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
