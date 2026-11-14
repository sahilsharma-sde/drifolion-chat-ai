import { getConversation } from "../services/conversation.service";

export async function memoryAgent(
    conversationId: string
){
    const conversation = await getConversation(conversationId);

    return conversation?.summary || "";
}