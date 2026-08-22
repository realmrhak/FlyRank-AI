import { Handle, Position, useReactFlow } from 'reactflow';

/**
 * A custom node representing one decision step in the workflow.
 * - The textarea lets the user edit the yes/no question directly on the canvas.
 * - It has TWO source handles: a green "YES" handle and a red "NO" handle.
 *   Dragging a connection from a specific handle decides which path it is —
 *   App.jsx reads `sourceHandle` in onConnect to style/label the edge.
 * - data.status drives the Phase 4 "better node styling" visual states:
 *   'idle' (default), 'active' (currently being evaluated — pulses),
 *   'done-yes' / 'done-no' (finished, tinted by the answer it got),
 *   'error' (the AI call failed here).
 */
function QuestionNode({ id, data }) {
  const { setNodes } = useReactFlow();

  const updatePrompt = (event) => {
    const value = event.target.value;
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: value } } : node))
    );
  };

  const status = data.status || 'idle';

  return (
    <div className={`question-node status-${status}`}>
      <Handle type="target" position={Position.Top} className="handle-target" />

      <div className="question-node-header">
        <span>Question</span>
        {status === 'active' && <span className="status-pill status-pill-active">Thinking…</span>}
        {status === 'done-yes' && <span className="status-pill status-pill-yes">YES</span>}
        {status === 'done-no' && <span className="status-pill status-pill-no">NO</span>}
        {status === 'error' && <span className="status-pill status-pill-error">Error</span>}
      </div>

      <textarea
        className="question-node-textarea nodrag"
        value={data.label}
        onChange={updatePrompt}
        placeholder="Type a yes/no question…"
        rows={3}
      />

      {status === 'error' && data.errorMessage && (
        <div className="question-node-error">{data.errorMessage}</div>
      )}

      <div className="question-node-footer">
        <div className="handle-row handle-row-no">
          <span className="handle-label">NO</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="handle-source handle-source-no"
            style={{ left: '30%' }}
          />
        </div>
        <div className="handle-row handle-row-yes">
          <span className="handle-label">YES</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="handle-source handle-source-yes"
            style={{ left: '70%' }}
          />
        </div>
      </div>
    </div>
  );
}

export default QuestionNode;
