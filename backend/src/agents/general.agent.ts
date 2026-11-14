import { llm } from "../config/groq";

export async function generalAgent(
  messages: any[]
){
  const response =
    await llm.invoke(messages);

  return response.content;
}