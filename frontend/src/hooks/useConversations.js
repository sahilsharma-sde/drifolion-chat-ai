import { useEffect, useState } from "react";

import {
  getConversations,
  createConversation,
} from "../services/conversationApi";

export default function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getConversations();

      setConversations(data);

      if (data.length > 0) {
        setActiveConversationId((prev) => prev || data[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewChat = async () => {
    try {
      const conversation = await createConversation("New Chat");

      setConversations((prev) => [conversation, ...prev]);

      setActiveConversationId(conversation._id);

      return conversation;
    } catch (error) {
      console.error(error);
    }
  };

  return {
    conversations,

    activeConversationId,
    setActiveConversationId,

    loadConversations,
    handleNewChat,
  };
}
