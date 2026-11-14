export const ROUTE_META = {
  coding: { label: "Coding Agent", color: "#8b7bff", icon: "⌘" },
  rag: { label: "Knowledge Agent", color: "#00d4ff", icon: "◆" },
  general: { label: "General Agent", color: "#ff9a3c", icon: "✦" },
};

export function getRouteMeta(route) {
  return ROUTE_META[route] || null;
}
