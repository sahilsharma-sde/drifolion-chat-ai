import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { evaluate } from "mathjs";

export const calculatorTool = tool(
  async ({ expression }) => {
    console.log(
      "CALCULATOR TOOL CALLED:",
      expression
    );
    const result = evaluate(expression);

    return String(result);
  },
  {
    name: "calculator",
    description: "Perform mathematical calculations",
    schema: z.object({
      expression: z.string()
    })
  }
);