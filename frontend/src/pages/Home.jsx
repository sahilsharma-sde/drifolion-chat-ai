import MainLayout from "../components/layout/MainLayout";
import Sidebar from "../components/sidebar/Sidebar";
import { useEffect } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import GuestBanner from "../components/chat/GuestBanner";

import useChat from "../hooks/useChat";
import useConversations from "../hooks/useConversations";
import useDocuments from "../hooks/useDocuments";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isGuest, guest, noteGuestMessage, markGuestLimitReached } = useAuth();

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    handleNewChat,
    loadConversations,
  } = useConversations();

  const {
    messages,
    loading,
    sendMessage,
    loadMessages,
    streamingMessageIndex,
  } = useChat(activeConversationId);

  // Guests have no document library, so only load/upload for real accounts.
  const {
    documents,
    uploading,
    status: attachStatus,
    upload,
    remove: removeDocument,
  } = useDocuments(!isGuest);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const guestLimitReached = isGuest && guest.messagesUsed >= guest.messageLimit;

  const handleSend = async (query) => {
    if (guestLimitReached) return;

    // A brand-new user has no conversations yet — auto-create one on the
    // first message instead of sending a null conversationId (which
    // previously reached the backend as the literal string "null" and
    // crashed the CastError).
    let conversationId = activeConversationId;

    if (!conversationId) {
      const conversation = await handleNewChat();
      conversationId = conversation?._id;

      if (!conversationId) return; // creation failed; bail quietly
    }

    const error = await sendMessage(conversationId, query);

    if (isGuest) {
      if (error?.code === "GUEST_LIMIT_REACHED") markGuestLimitReached();
      else if (!error) noteGuestMessage();
    }

    await loadConversations();
  };

  return (
    <MainLayout
      sidebar={
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewChat={handleNewChat}
          isGuest={isGuest}
          documents={documents}
          onRemoveDocument={removeDocument}
        />
      }
    >
      {isGuest && <GuestBanner guest={guest} />}

      <ChatWindow
        messages={messages}
        streamingMessageIndex={streamingMessageIndex}
        onPromptSelect={handleSend}
      />

      {loading && <TypingIndicator />}

      <ChatInput
        loading={loading}
        onSend={handleSend}
        canAttach={!isGuest}
        onAttach={upload}
        uploading={uploading}
        attachStatus={attachStatus}
        disabledReason={
          guestLimitReached
            ? "Free messages used up — create a free account to keep chatting"
            : ""
        }
      />
    </MainLayout>
  );
}
