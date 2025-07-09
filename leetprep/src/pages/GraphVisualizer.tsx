import React from "react";
import ReactFlow, { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

interface GraphProps {
  input: string;
}

const GraphVisualizer: React.FC<GraphProps> = ({ input }) => {
  let graph: Record<string, number[]>;

  try {
    graph = JSON.parse(input);
  } catch (err) {
    return <div style={{ color: "red" }}>Invalid graph input format.</div>;
  }

  const nodes: Node[] = Object.keys(graph).map((key, index) => ({
    id: key,
    position: { x: (index % 5) * 120, y: Math.floor(index / 5) * 120 }, // Grid-style layout
    data: { label: `Node ${key}` },
    type: "default",
  }));

  const edges: Edge[] = Object.entries(graph).flatMap(([src, targets]) =>
    targets.map((t) => ({
      id: `${src}-${t}`,
      source: src,
      target: String(t),
      type: "default",
      animated: true,
    }))
  );

  return (
    <div style={{ height: 300, border: "1px solid #ccc", borderRadius: 6, zIndex: 0 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.2 }} />
    </div>
  );
};

export default GraphVisualizer;
