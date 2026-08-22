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

const API_BASE = 'http://localhost:3001';

// A workflow always starts with one example node so the canvas isn't empty.
// Each node's "data.label" is the yes/no question sent to the AI when the
// workflow runs.
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
// handle ("yes" or "no") the user dragged the connection from.
const edgeStyleFor = (kind) =>
  kind === 'yes'
    ? { stroke: '#2f9e63', strokeWidth: 2.2 }
    : { stroke: '#e0555f', strokeWidth: 2.2 };

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState(null);

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

  // A "start node" is one nothing else points to. If there's more than one
  // candidate (or none), we just fall back to the first node in the list.
  const findStartNodeId = () => {
    const targetIds = new Set(edges.map((e) => e.target));
    const candidate = nodes.find((n) => !targetIds.has(n.id));
    return candidate ? candidate.id : nodes[0]?.id;
  };

  const pollForResult = (runId) => {
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/run-workflow/${runId}`);
        const data = await res.json();

        if (data.status === 'done') {
          clearInterval(intervalId);
          setIsRunning(false);
          setRunResult(data);
        } else if (data.status === 'error') {
          clearInterval(intervalId);
          setIsRunning(false);
          setRunError(data.error);
        }
        // if still 'pending', keep polling
      } catch (err) {
        clearInterval(intervalId);
        setIsRunning(false);
        setRunError('Lost connection while checking run status.');
      }
    }, 1000);
  };

  const runWorkflow = async () => {
    setRunResult(null);
    setRunError(null);

    const startNodeId = findStartNodeId();
    if (!startNodeId) {
      setRunError('Add at least one node before running the workflow.');
      return;
    }

    // Simplify edges to what the backend needs: source, target, kind
    const simpleEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
      kind: e.data?.kind === 'yes' ? 'yes' : 'no',
    }));

    setIsRunning(true);

    try {
      const res = await fetch(`${API_BASE}/api/run-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges: simpleEdges, startNodeId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to start workflow run');
      }

      const { runId } = await res.json();
      pollForResult(runId);
    } catch (err) {
      setIsRunning(false);
      setRunError(err.message);
    }
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
          <button className="btn btn-ghost" onClick={runWorkflow} disabled={isRunning}>
            {isRunning ? 'Running…' : 'Run Workflow'}
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

        {(isRunning || runResult || runError) && (
          <div className="results-panel">
            <div className="results-panel-header">
              <span>Execution Result</span>
              {!isRunning && (
                <button
                  className="results-panel-close"
                  onClick={() => {
                    setRunResult(null);
                    setRunError(null);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {isRunning && <div className="results-panel-status">Asking the AI at each node…</div>}

            {runError && <div className="results-panel-error">{runError}</div>}

            {runResult && (
              <ol className="results-panel-list">
                {runResult.path.map((step, i) => (
                  <li key={i}>
                    <span className="results-step-prompt">{step.prompt}</span>
                    <span className={`results-step-answer answer-${step.answer.toLowerCase()}`}>
                      {step.answer}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
