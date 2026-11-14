import { llm } from "../config/groq";
import { HumanMessage } from "@langchain/core/messages";
import { SystemMessage } from "@langchain/core/messages";

export async function routeAgent(message: string) {
  const response = await llm.invoke([
    new SystemMessage(`
You are Nexus Supervisor.

Choose exactly one:

coding
rag
general

Return ONLY the route name.
No explanation.
No thinking.
No markdown.
`),
    new HumanMessage(message),
  ]);

  const parsed = JSON.parse(response.content.toString());

  return parsed.route;

  //return response.content.toString().trim().toLowerCase();
}
