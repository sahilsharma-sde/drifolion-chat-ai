Model Strategy:
| Task           | Model          |
| -------------- | -------------- |
| Chat           | Qwen3 8B       |
| Coding         | DeepSeek Coder |
| Reasoning      | DeepSeek-R1    |
| RAG            | Qwen3          |
| Agent Planning | DeepSeek-R1    |


What We Build First

I would not start with authentication.

For an AI application, the most important thing is proving the AI pipeline works.

Sprint 1
✅ Express Server
✅ TypeScript Setup
✅ Groq Connection
✅ Streaming Endpoint
✅ Basic Chat Endpoint

Goal:

POST /api/chat

Input:
{
  "message": "Hello"
}

Output:
Streaming response from Qwen3
Sprint 2
✅ LangGraph
✅ Supervisor Agent
✅ Tool Calling
Sprint 3
✅ MongoDB
✅ Authentication
✅ Conversation Storage
Sprint 4
✅ Qdrant
✅ Document Upload
✅ RAG
Sprint 5
✅ Memory
✅ Multi-Agent
✅ Research Agent
✅ Coding Agent

This order gets a working AI system much faster and avoids spending days on authentication before the core AI functionality exists.