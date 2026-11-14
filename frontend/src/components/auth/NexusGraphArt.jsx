// A quiet, on-brand signature visual: nodes = agents (supervisor, rag, coding,
// general, memory) connected through a router, echoing the app's actual
// LangGraph architecture rather than a generic decorative graphic.
export default function NexusGraphArt() {
  const nodes = [
    { id: "supervisor", x: 200, y: 90, label: "Supervisor" },
    { id: "router", x: 200, y: 190, label: "Router" },
    { id: "rag", x: 70, y: 300, label: "RAG" },
    { id: "coding", x: 200, y: 320, label: "Coding" },
    { id: "general", x: 330, y: 300, label: "General" },
  ];

  const edges = [
    ["supervisor", "router"],
    ["router", "rag"],
    ["router", "coding"],
    ["router", "general"],
  ];

  const find = (id) => nodes.find((n) => n.id === id);

  return (
    <svg
      viewBox="0 0 400 380"
      className="w-full h-full"
      role="img"
      aria-label="Diagram of Nexus AI's multi-agent routing graph"
    >
      <defs>
        <linearGradient id="edgeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a5af9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6a5af9" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#6a5af9" stopOpacity="0" />
        </radialGradient>
      </defs>

      {edges.map(([from, to], i) => {
        const a = find(from);
        const b = find(to);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="url(#edgeGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="16"
              to="0"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </line>
        );
      })}

      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="34" fill="url(#nodeGlow)" />
          <circle
            cx={n.x}
            cy={n.y}
            r={n.id === "supervisor" ? 14 : 10}
            fill="var(--nexus-bg-elevated)"
            stroke={n.id === "supervisor" ? "#00d4ff" : "#6a5af9"}
            strokeWidth="2"
          />
          <text
            x={n.x}
            y={n.y + 30}
            textAnchor="middle"
            fontSize="11"
            fill="#94a3b8"
            fontFamily="Inter, sans-serif"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
