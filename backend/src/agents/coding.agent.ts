// import { llm } from "../config/groq";

// export async function codingAgent(
//   message: any[]
// ) {
//   return await llm.invoke([
//     {
//       role: "system",
//       content: `
// You are Nexus Coding Agent.

// Expert in:
// - JavaScript
// - TypeScript
// - React
// - Node.js
// - Express
// - MongoDB
// `
//     },
//     {
//       role: "user",
//       content: message
//     }
//   ]);
// }
import { llm } from "../config/groq";
import { SystemMessage } from "@langchain/core/messages";

export async function codingAgent(
  messages: any[]
){
  return await llm.invoke([
    new SystemMessage(`
You are Nexus Coding Agent.

Expert in:
- JavaScript
- TypeScript
- React
- Node.js
- Express
- MongoDB
`),

    ...messages
  ]);
}