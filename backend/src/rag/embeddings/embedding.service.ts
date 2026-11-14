import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

export const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "BAAI/bge-small-en-v1.5",
});
