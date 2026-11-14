import { llm } from "../config/groq";

export async function summarizeConversation(messages: string) {
  const response = llm.invoke(`
    Summarize this conversation
for long-term memory.

Keep important facts,
preferences, goals,
projects, and context.

Conversation:
${messages}    
    `);

    return (await response).content;
}
