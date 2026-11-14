import { StateGraph, START, END } from "@langchain/langgraph";

import { graphState } from "./state";

import { supervisorNode } from "./nodes/supervisor.node";
import { codingNode } from "./nodes/coding.node";
import { ragNode } from "./nodes/rag.node";
import { generalNode } from "./nodes/general.node";

import { routeSupervisor } from "./router";

export const nexusGraph = new StateGraph(graphState)

  .addNode("supervisor", supervisorNode)

  .addNode("coding", codingNode)

  .addNode("rag", ragNode)

  .addNode("general", generalNode)

  .addEdge(START, "supervisor")

  .addConditionalEdges("supervisor", routeSupervisor, {
    coding: "coding",
    rag: "rag",
    general: "general",
  })

  .addEdge("coding", END)

  .addEdge("rag", END)

  .addEdge("general", END)

  .compile();
