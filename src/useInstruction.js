import { useNodesState, useEdgesState } from 'reactflow';

function useInstruction() {
    const [iNodes, setINodes, onINodesChange] = useNodesState([]);
    const [iEdges, setIEdges, onIEdgesChange] = useEdgesState([]);

    return { iNodes, iEdges, setINodes, setIEdges, onINodesChange, onIEdgesChange };
}

export default useInstruction;