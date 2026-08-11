"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  BackgroundVariant,
  NodeTypes,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import { CloudNodeCard } from "./cloud-node";
import { mockNodes, mockEdges } from "@/data/mock-infrastructure";
import { CloudNode } from "@/types/infrastructure";
import { NodeDetailsPanel } from "./node-details-panel";

const nodeTypes: NodeTypes = Object.freeze({
  cloudNode: CloudNodeCard,
});

function buildFlowNodes(cloudNodes: CloudNode[]): Node[] {
  const positions: Record<string, { x: number; y: number }> = {
    "lb-1": { x: 350, y: 0 },
    "compute-1": { x: 150, y: 150 },
    "compute-2": { x: 550, y: 150 },
    "cache-1": { x: 150, y: 320 },
    "db-1": { x: 550, y: 320 },
    "storage-1": { x: 350, y: 470 },
  };

  return cloudNodes.map((node) => ({
    id: node.id,
    type: "cloudNode",
    position: positions[node.id] ?? { x: 0, y: 0 },
    data: node,
  }));
}

function buildFlowEdges(): Edge[] {
  return mockEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: edge.animated,
    style: { stroke: "#06B6D4", strokeWidth: 1.5, opacity: 0.5 },
  }));
}

interface InfrastructureGraphProps {
  // Mapa nodeId -> procent postępu (0-100), przekazywana z terminala wdrożenia.
  // Gdy węzeł ma wpis w tej mapie i progress < 100, pokazujemy go jako "provisioning".
  deployProgress?: Record<string, number>;
}

export function InfrastructureGraph({ deployProgress = {} }: InfrastructureGraphProps) {
  const initialNodes = useMemo(() => buildFlowNodes(mockNodes), []);
  const initialEdges = useMemo(() => buildFlowEdges(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNode, setSelectedNode] = useState<CloudNode | null>(null);

  // Za każdym razem, gdy deployProgress się zmienia, nakładamy status
  // "provisioning" na węzły, które są w trakcie tworzenia
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((n) => {
        const progress = deployProgress[n.id];
        const originalNode = mockNodes.find((m) => m.id === n.id);
        if (!originalNode) return n;

        const isProvisioning = progress !== undefined && progress < 100;
        const updatedData: CloudNode = {
          ...originalNode,
          status: isProvisioning ? "provisioning" : originalNode.status,
        };

        return { ...n, data: updatedData };
      })
    );
  }, [deployProgress, setNodes]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as CloudNode);
  }, []);

  return (
    <div className="relative w-full h-[650px] glass-panel rounded-2xl overflow-hidden border border-cyan-500/10">
      <span className="absolute top-3 left-3 z-10 text-[10px] text-white/30 bg-[#0A0A0C]/60 px-2 py-1 rounded-md pointer-events-none">
        Zoom: przyciski w lewym dolnym rogu lub gest uszczypnięcia
      </span>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
        zoomOnPinch={true}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(6,182,212,0.15)"
        />
        <Controls className="!bg-[#0A0A0C] !border !border-cyan-500/20 !rounded-lg [&>button]:!bg-[#0A0A0C] [&>button]:!border-cyan-500/10 [&>button]:!text-cyan-400" />
        <MiniMap
          className="!bg-[#0A0A0C] !border !border-cyan-500/20 !rounded-lg"
          maskColor="rgba(10,10,12,0.8)"
          nodeColor="#06B6D4"
        />
      </ReactFlow>

      <NodeDetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}