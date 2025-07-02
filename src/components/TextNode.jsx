// src/components/TextNode.jsx
import { Handle, Position } from '@xyflow/react'; // Handle is for connecting nodes
import { memo } from 'react';
import './TextNode.css'; // Import custom styles for our node

// This component will render our custom node
function TextNode({ id, data }) {
  // The `data` prop will contain `label` (our note text) and `onTextChange` (a function from App.jsx)

  const onLabelChange = (evt) => {
    // When the textarea content changes, we call the function passed from App.jsx
    // This function will be responsible for updating the node's data in the main state
    if (data.onTextChange) {
      data.onTextChange(id, evt.target.value);
    }
  };

  return (
    <div className="text-node"> {/* A div for styling our custom note */}
      {/* Handle for incoming connections (top of the note) */}
      <Handle type="target" position={Position.Top} />

      <textarea
        value={data.label} // Display the current text
        onChange={onLabelChange} // Update text when user types
        className="nodrag" // Prevents dragging the note when dragging inside the textarea
        rows={5} // Default number of rows
        cols={20} // Default number of columns
        // style={{ width: '100%', height: '100%', resize: 'none' }} // Make it fill the note area
      />

      {/* Handle for outgoing connections (bottom of the note) */}
      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
}

export default memo(TextNode); // Use memo to prevent unnecessary re-renders