import { useState, useEffect } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';

function usePlan(url) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const nodes = data.task_list.map((task, index) => ({
          id: task.task_num.toString(),
          position: { x: (index % 2 === 0 ? 130 : 70), y: 100 + 150 * index },
          data: { label: `Task ${task.task_num}: ${task.task}` },
          raw: task,
        }));

        const edges = Object.entries(data.task_dependency).flatMap(([target, sources]) => {
          return sources.map((source) => ({
            id: 'e' + source + '-' + target,
            source: source.toString(),
            target: target,
            animated: true,
            style: { stroke: 'red' },
          }));
        });

        setNodes(nodes);
        setEdges(edges);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [url, setNodes, setEdges]);

  return { nodes, edges, loading, error, setNodes, setEdges, onNodesChange, onEdgesChange };
}

export default usePlan;
