// import { llm } from "../config/groq";
// import { tools } from "../tools";

// export const supervisorAgent = llm.bindTools(tools);


import { llm } from "../config/groq";
import { z } from "zod";

const RouteSchema = z.object({
  route: z.enum([
    "coding",
    "rag",
    "general",
  ]),
});

export const supervisorAgent =
  llm.withStructuredOutput(
    RouteSchema
  );