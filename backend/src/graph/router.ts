export function routeSupervisor(
  state: any
): "coding" | "rag" | "general" {

  const route =
    String(state.route ?? "")
      .trim()
      .toLowerCase();

  if (
    route !== "coding" &&
    route !== "rag" &&
    route !== "general"
  ) {
    return "general";
  }

  return route as "coding" | "rag" | "general";
}