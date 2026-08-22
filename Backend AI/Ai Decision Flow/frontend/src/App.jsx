import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import QuestionNode from './components/QuestionNode.jsx';
import './App.css';

// A workflow always starts with one example node so the canvas isn't empty.
// Each node's "data.label" is the yes/no question sent to the AI when the
// workflow runs (that part is built in Phase 3).
const initialNodes = [
  {
    id: '1',
    type: 'question',
    position: { x: 320, y: 120 },
    data: { label: 'Is this a support request?' },
  },
];

const initialEdges = [];

let nextNodeId = 2;

// Styling for the two edge kinds. Which one gets used is decided by which
// handle ("yes" or "no") the user dragged the connection from — see
// onConnect below.
const edgeStyleFor = (kind) =>
  kind === 'yes'
    ? { stroke: '#2f9e63', strokeWidth: 2.2 }
    : { stroke: '#e0555f', strokeWidth: 2.2 };

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const nodeTypes = useMemo(() => ({ question: QuestionNode }), []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((connection) => {
    // connection.sourceHandle is "yes" or "no" depending on which handle
    // the user dragged from (defined in QuestionNode.jsx).
    const kind = connection.sourceHandle === 'yes' ? 'yes' : 'no';

    const newEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${kind}-${Date.now()}`,
      label: kind.toUpperCase(),
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 6,
      labelStyle: {
        fontFamily: 'Jost, sans-serif',
        fontWeight: 600,
        fontSize: 11,
        fill: kind === 'yes' ? '#2f9e63' : '#e0555f',
      },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
      style: edgeStyleFor(kind),
      markerEnd: { type: MarkerType.ArrowClosed, color: kind === 'yes' ? '#2f9e63' : '#e0555f' },
      data: { kind },
    };

    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const addNode = () => {
    const id = String(nextNodeId++);
    const newNode = {
      id,
      type: 'question',
      position: { x: 300 + (nodes.length % 3) * 60, y: 120 + nodes.length * 160 },
      data: { label: 'New question…' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-mark">AI</div>
          <div className="topbar-titles">
            <h1>Decision Flow</h1>
            <span>Build a yes / no workflow, then run it</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" disabled title="Coming in Phase 3">
            Run Workflow
          </button>
          <button className="btn btn-primary" onClick={addNode}>
            + Add Node
          </button>
        </div>
      </header>

      <div className="canvas-wrap">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="#e4e1f5" />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor="#7c6fe8"
            maskColor="rgba(124, 111, 232, 0.06)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
