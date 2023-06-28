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
  const [theme, setTheme] = useState({});
  const [themeColor, setThemeColor] = useState('red');
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
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Set dark theme
      setTheme("monokai");
      setThemeColor("aqua")
    } else {
      // Set light theme
      setTheme("rjv-default");
      setThemeColor("blue")
    }
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
        let lastThenId = null;
        let lastElseId = null;

        // Copy the instructions array
        let copied_instructions = [...data.instructions];

        // If the last instruction is a Loop, add a virtual Loop End instruction
        if (copied_instructions[copied_instructions.length - 1].type === 'Loop') {
          let sub_instructions_in_last_loop = copied_instructions[copied_instructions.length - 1].args.instructions;
          copied_instructions.push({
            seq: sub_instructions_in_last_loop[sub_instructions_in_last_loop.length - 1].seq + 1,
            type: 'LoopEnd',
            objective: 'End of Loop',
            args: {}
          });
        }

        copied_instructions.forEach((inst, i) => {
          const currentId = inst.seq.toString();
          nodes.push({
            id: currentId,
            position: { x: 180, y: 140 + 150 * y },
            data: { label: inst.type === 'LoopEnd' ? 'Loop End' : inst.type === "Loop" ? `Loop: ${inst.objective}` : inst.objective },
            raw: inst,
          });

          if (lastThenId !== null && lastElseId !== null) {
            // connect the previous 'then' and 'else' instructions to this instruction
            edges.push({ id: 'e' + lastThenId + '-' + currentId, source: lastThenId, target: currentId, animated: true, style: { stroke: themeColor } });
            edges.push({ id: 'e' + lastElseId + '-' + currentId, source: lastElseId, target: currentId, animated: true, style: { stroke: themeColor } });
            lastThenId = null;
            lastElseId = null;
          } else if (i > 0) {
            // if it's not the first instruction, add an edge from the previous instruction
            edges.push({ id: 'e' + currentId, source: copied_instructions[i - 1].seq.toString(), target: currentId, animated: true, style: { stroke: themeColor } });
          }

          y++;

          if (inst.type === 'If') {
            const thenInst = inst.then[0];  // assuming each branch only has one instruction for simplicity
            const thenId = `${thenInst.seq}`;
            nodes.push({
              id: thenId,
              position: { x: 80, y: 140 + 150 * y + 10 },
              data: { label: `${thenInst.objective}` },
              raw: thenInst,
            });
            edges.push({ id: 'e' + thenId, source: currentId, target: thenId, animated: true, style: { stroke: themeColor }, label: 'Yes' });

            const elseInst = inst.else[0];  // assuming each branch only has one instruction for simplicity
            const elseId = `${elseInst.seq}`;
            nodes.push({
              id: elseId,
              position: { x: 280, y: 140 + 150 * y + 10 },
              data: { label: `${elseInst.objective}` },
              raw: elseInst,
            });
            edges.push({ id: 'e' + elseId, source: currentId, target: elseId, animated: true, style: { stroke: themeColor }, label: 'No' });

            // store the IDs of the 'then' and 'else' instructions
            lastThenId = thenId;
            lastElseId = elseId;

            y++;
          }

          if (inst.type === 'Loop') {
            inst.args.instructions.forEach((loopInst, loopIndex) => {
              const loopId = `${loopInst.seq}`;
              nodes.push({
                id: loopId,
                position: { x: 280, y: 140 + 150 * y },
                data: { label: `${loopInst.objective}` },
                raw: loopInst,
              });
              if (loopIndex > 0) {
                edges.push({ id: 'e' + loopId, source: inst.args.instructions[loopIndex - 1].seq.toString(), target: loopId, animated: true, style: { stroke: themeColor } });
              } else {
                // first instruction in the loop, connect it to the loop instruction
                edges.push({ id: 'e' + loopId, source: currentId, target: loopId, animated: true, style: { stroke: themeColor } });
              }
              // last instruction in the loop, connect it to the next instruction after loop
              if (loopIndex === inst.args.instructions.length - 1 && i < copied_instructions.length - 1) {
                edges.push({ id: 'e' + loopId + '-' + copied_instructions[i + 1].seq.toString(), source: loopId, target: copied_instructions[i + 1].seq.toString(), animated: true, style: { stroke: themeColor } });
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
  }, [selectedNode, setINodes, setIEdges, themeColor]);

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
        {selectedNode && <ReactJson src={selectedNode.raw} theme={theme} />}
        <h3>{selectedINode && "Instruction #" + selectedINode.raw.seq}</h3>
        {selectedINode && <ReactJson src={selectedINode.raw} theme={theme} />}
      </div>
    </div>
  );
}
