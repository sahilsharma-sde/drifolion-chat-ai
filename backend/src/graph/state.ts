import { Annotation } from "@langchain/langgraph";

export const graphState = Annotation.Root({
  messages: Annotation<any[]>({
    reducer: (state, update) => state.concat(update),

    default: () => [],
  }),

  route: Annotation<string>({
    reducer: (_, update) => update,

    default: () => "",
  }),
});
