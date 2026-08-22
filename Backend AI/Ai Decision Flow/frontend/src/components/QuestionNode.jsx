import { Handle, Position, useReactFlow } from 'reactflow';

/**
 * A custom node representing one decision step in the workflow.
 * - The textarea lets the user edit the yes/no question directly on the canvas.
 * - It has TWO source handles: a green "YES" handle (right) and a red "NO"
 *   handle (bottom). Dragging a connection from a specific handle is how the
 *   user defines which path is which — App.jsx reads `sourceHandle` in
 *   onConnect to style/label the resulting edge correctly.
 * - One target handle (top) accepts incoming connections from other nodes.
 */
function QuestionNode({ id, data }) {
  const { setNodes } = useReactFlow();

  const updatePrompt = (event) => {
    const value = event.target.value;
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: value } } : node))
    );
  };

  return (
    <div className="question-node">
      <Handle type="target" position={Position.Top} className="handle-target" />

      <div className="question-node-header">Question</div>
      <textarea
        className="question-node-textarea nodrag"
        value={data.label}
        onChange={updatePrompt}
        placeholder="Type a yes/no question…"
        rows={3}
      />

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
