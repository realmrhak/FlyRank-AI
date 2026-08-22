import { useCallback, useMemo, useRef, useState } from 'react';
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
const STEP_ANIMATION_MS = 700; // how long each node "thinks" during the replay animation

const initialNodes = [
  {
    id: '1',
    type: 'question',
    position: { x: 320, y: 120 },
    data: { label: 'Is this a support request?', status: 'idle' },
  },
];

const initialEdges = [];

let nextNodeId = 2;

const edgeStyleFor = (kind) =>
  kind === 'yes'
    ? { stroke: '#2f9e63', strokeWidth: 2.2 }
    : { stroke: '#e0555f', strokeWidth: 2.2 };

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

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
      data: { label: 'New question…', status: 'idle' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const findStartNodeId = () => {
    const targetIds = new Set(edges.map((e) => e.target));
    const candidate = nodes.find((n) => !targetIds.has(n.id));
    return candidate ? candidate.id : nodes[0]?.id;
  };

  // Resets every node's visual status and every edge's "traveled" highlight
  // back to normal — called before a new run starts.
  const resetVisualState = () => {
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, status: 'idle', errorMessage: undefined } })));
    setEdges((eds) => eds.map((e) => ({ ...e, className: '' })));
  };

  const setNodeStatus = (nodeId, status, extra = {}) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status, ...extra } } : n))
    );
  };

  const highlightEdge = (sourceId, kind, targetId) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.source === sourceId && e.target === targetId && e.data?.kind === kind
          ? { ...e, className: 'edge-active', animated: true }
          : e
      )
    );
  };

  // Replays the finished run step-by-step so the person can watch the AI's
  // path through the graph, instead of the result just appearing instantly.
  const animatePath = async (path, failedNodeId, errorMessage) => {
    setIsAnimating(true);
    for (let i = 0; i < path.length; i++) {
      const step = path[i];
      setNodeStatus(step.nodeId, 'active');
      await new Promise((r) => setTimeout(r, STEP_ANIMATION_MS));

      const doneStatus = step.answer === 'YES' ? 'done-yes' : 'done-no';
      setNodeStatus(step.nodeId, doneStatus);

      const next = path[i + 1];
      if (next) {
        highlightEdge(step.nodeId, step.answer.toLowerCase(), next.nodeId);
      }
      await new Promise((r) => setTimeout(r, 150));
    }

    if (failedNodeId) {
      setNodeStatus(failedNodeId, 'error', { errorMessage });
    }

    setIsAnimating(false);
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
          setHistory((h) => [{ id: runId, time: new Date(), status: 'done', path: data.path }, ...h]);
          animatePath(data.path);
        } else if (data.status === 'error') {
          clearInterval(intervalId);
          setIsRunning(false);
          setRunError(data.error);
          setHistory((h) => [
            { id: runId, time: new Date(), status: 'error', path: data.path, error: data.error },
            ...h,
          ]);
          animatePath(data.path || [], data.failedNodeId, data.error);
        }
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
    resetVisualState();

    const startNodeId = findStartNodeId();
    if (!startNodeId) {
      setRunError('Add at least one node before running the workflow.');
      return;
    }

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
        body: JSON.stringify({ nodes: nodesRef.current, edges: simpleEdges, startNodeId }),
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
          <button
            className="btn btn-ghost"
            onClick={() => setHistoryOpen((o) => !o)}
          >
            History {history.length > 0 && <span className="count-badge">{history.length}</span>}
          </button>
          <button className="btn btn-ghost" onClick={runWorkflow} disabled={isRunning || isAnimating}>
            {isRunning ? 'Running…' : isAnimating ? 'Animating…' : 'Run Workflow'}
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
          <MiniMap pannable zoomable nodeColor="#7c6fe8" maskColor="rgba(124, 111, 232, 0.06)" />
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

            {runError && (
              <div className="results-panel-error-block">
                <div className="results-panel-error">{runError}</div>
                <button className="btn btn-ghost btn-small" onClick={runWorkflow}>
                  Retry Workflow
                </button>
              </div>
            )}

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

        {historyOpen && (
          <div className="history-panel">
            <div className="results-panel-header">
              <span>Execution History</span>
              <button className="results-panel-close" onClick={() => setHistoryOpen(false)}>
                ✕
              </button>
            </div>
            {history.length === 0 && (
              <div className="results-panel-status">No runs yet — click "Run Workflow" to start one.</div>
            )}
            <ul className="history-list">
              {history.map((run) => (
                <li key={run.id + run.time.toISOString()} className={`history-item history-${run.status}`}>
                  <div className="history-item-top">
                    <span className={`history-dot history-dot-${run.status}`} />
                    <span className="history-time">{run.time.toLocaleTimeString()}</span>
                    <span className="history-steps">{run.path?.length || 0} steps</span>
                  </div>
                  {run.status === 'error' && <div className="history-error">{run.error}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
