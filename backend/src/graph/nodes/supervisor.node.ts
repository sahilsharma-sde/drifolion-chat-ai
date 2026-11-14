import { supervisorAgent } from "../../agents/supervisor.agent";

export async function supervisorNode(state: any) {
  const userMessage = state.messages[state.messages.length - 1].content;

  const result = await supervisorAgent.invoke(`
You are Nexus Supervisor.

Choose exactly one route:

coding
rag
general

Routing Rules:

coding:
- programming
- software engineering
- debugging
- algorithms
- coding interviews
- React
- Node.js
- JavaScript
- TypeScript
- databases development
- system design

rag:
- educational questions
- definitions
- theory questions
- concepts
- explanations
- questions likely answered by uploaded documents
- academic content
- study material

general:
- greetings
- casual conversation
- opinions
- brainstorming
- anything not matching coding or rag

User Question:
${userMessage}
`);

  console.log("🧠 Supervisor Route:", result.route);

  return {
    route: result.route,
  };
}
