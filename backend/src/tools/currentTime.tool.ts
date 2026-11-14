import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const currentTimeTool = tool(
  async () => {
    console.log(
      "CURRENT TIME TOOL CALLED"
    );
    return new Date().toISOString();
  },
  {
    name: "current_time",
    description: "Get current date and time",
    schema: z.object({})
  }
);