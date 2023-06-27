import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
} from 'reactflow';
import ReactJson from 'react-json-view';
import usePlan from './usePlan';
import useInstruction from './useInstruction';

import 'reactflow/dist/style.css';

export default function App() {
  const { nodes, edges, loading, error, setEdges, onEdgesChange, onNodesChange } = usePlan('/static/plan.json');
  const { iNodes, iEdges, setINodes, setIEdges, onINodesChange, onIEdgesChange } = useInstruction();
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedINode, setSelectedINode] = useState(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onIConnect = useCallback((params) => setIEdges((eds) => addEdge(params, eds)), [setIEdges]);

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setSelectedINode(null);
  }, []);

  const handleINodeClick = useCallback((_, node) => {
    setSelectedINode(node);
  }, []);

  useEffect(() => {
    if (selectedNode !== null && selectedNode.id !== null) {
      fetch('/static/' + selectedNode.id + '.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        let y = 0;
        const nodes = [];
        const edges = [];
        data.instructions.forEach((inst, i) => {
          const currentId = inst.seq.toString();
          nodes.push({
            id: currentId,
            position: { x: 180, y: 140 + 100 * y },
            data: { label: `Instruction #${inst.seq}: ${inst.type}` },
            raw: inst,
          });

          if (i > 0) {
            // if it's not the first instruction, add an edge from the previous instruction
            edges.push({ id: 'e' + currentId, source: data.instructions[i - 1].seq.toString(), target: currentId, animated: true, style: { stroke: 'red' } });
          }

          y++;

          if (inst.type === 'If') {
            const thenInst = inst.then[0];  // assuming each branch only has one instruction for simplicity
            const thenId = `${thenInst.seq}`;
            nodes.push({
              id: thenId,
              position: { x: 80, y: 140 + 100 * y },
              data: { label: `Instruction #${thenInst.seq} (then branch): ${thenInst.type}` },
              raw: thenInst,
            });
            edges.push({ id: 'e' + thenId, source: currentId, target: thenId, animated: true, style: { stroke: 'red' } });

            const elseInst = inst.else[0];  // assuming each branch only has one instruction for simplicity
            const elseId = `${elseInst.seq}`;
            nodes.push({
              id: elseId,
              position: { x: 280, y: 140 + 100 * y },
              data: { label: `Instruction #${elseInst.seq} (else branch): ${elseInst.type}` },
              raw: elseInst,
            });
            edges.push({ id: 'e' + elseId, source: currentId, target: elseId, animated: true, style: { stroke: 'red' } });

            y++;
          }

          if (inst.type === 'Loop') {
            inst.args.instructions.forEach((loopInst, loopIndex) => {
              const loopId = `${loopInst.seq}`;
              nodes.push({
                id: loopId,
                position: { x: 280, y: 140 + 100 * y },
                data: { label: `Instruction #${loopInst.seq} (loop): ${loopInst.type}` },
                raw: loopInst,
              });
              if (loopIndex > 0) {
                edges.push({ id: 'e' + loopId, source: inst.args.instructions[loopIndex - 1].seq.toString(), target: loopId, animated: true, style: { stroke: 'red' } });
              } else {
                // first instruction in the loop, connect it to the loop instruction
                edges.push({ id: 'e' + loopId, source: currentId, target: loopId, animated: true, style: { stroke: 'red' } });
              }
              y++;
            });
          }
        });

        setINodes(nodes);
        setIEdges(edges);
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }, [selectedNode, setINodes, setIEdges]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flexBasis: '20%', height: '100%', overflow: 'auto', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          zoomOnScroll={false}
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      <div style={{ flexBasis: '40%', height: '100%', overflow: 'auto', position: 'relative' }}>
      <ReactFlow
          nodes={iNodes}
          edges={iEdges}
          onNodeClick={handleINodeClick}
          onNodesChange={onINodesChange}
          onEdgesChange={onIEdgesChange}
          onConnect={onIConnect}
          zoomOnScroll={false}
        >
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      <div style={{ flexBasis: '40%', height: '100%', overflow: 'auto', position: 'relative' }}>
        <h3>{selectedNode && "Task #" + selectedNode.raw.task_num}</h3>
        {selectedNode && <ReactJson src={selectedNode.raw} />}
        <h3>{selectedINode && "Instruction #" + selectedINode.raw.seq}</h3>
        {selectedINode && <ReactJson src={selectedINode.raw} />}
      </div>
    </div>
  );
}
