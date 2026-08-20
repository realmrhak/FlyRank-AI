import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// A workflow always starts with one example node so the canvas isn't empty.
// Each node's "data.prompt" is the yes/no question that will be sent to the AI
// when the workflow runs (that part comes in Phase 3).
const initialNodes = [
  {
    id: '1',
    position: { x: 300, y: 140 },
    data: { label: 'Is this a support request?' },
    type: 'default',
  },
];

const initialEdges = [];

let nextNodeId = 2;

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  const addNode = () => {
    const id = String(nextNodeId++);
    const newNode = {
      id,
      position: { x: 300 + (nodes.length % 3) * 40, y: 140 + nodes.length * 130 },
      data: { label: 'New question node' },
      type: 'default',
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
          <button className="btn btn-ghost" disabled>
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
