// src/components/TextNode.jsx
import { Handle, Position } from '@xyflow/react'; // Handle is for connecting nodes
import { memo } from 'react';

let MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds
const MIN_OPACITY = 0.3; // Minimum opacity for the note


// This component will render our custom node
function TextNode({ id, data }) {
  // The `data` prop will contain `label` (our note text) and `onTextChange` (a function from App.jsx)
  const ageMs = Date.now() - (data.lastAccessed || 0);
  const opacity = Math.trunc((Math.max(MIN_OPACITY, 1 - ageMs / MAX_AGE_MS)) * 100); // Calculate opacity based on age
  // console.log('Opacity:', (Math.max(MIN_OPACITY, 1 - ageMs / MAX_AGE_MS)));

  const onLabelChange = (evt) => {
    // When the textarea content changes, we call the function passed from App.jsx
    // This function will be responsible for updating the node's data in the main state
    if (data.onTextChange) {
      data.onTextChange(id, evt.target.value);
    }
  };

  return (
    <div
      className="p-4 border border-[#555] rounded bg-[#333] text-[#eee] shadow-lg flex flex-col box-border"
      style={{ opacity: Math.max(MIN_OPACITY, 1 - ageMs / MAX_AGE_MS) }}
      onWheel={e => e.stopPropagation()} // Prevent scroll wheel from bubbling up to React Flow

    >
      {/* Handle for incoming connections (left of the note) */}
      {/*TODO: Make the "in" handle 'vibe' when out node is pulled out*/}
      <Handle
        type="target"
        position={Position.Left}
        className='!bg-amber-200'
      />

      <textarea
        value={data.label} // Display the current text
        onChange={onLabelChange} // Update text when user types
        className="border-none bg-transparent text-inherit font-inherit text-[14px] p-0 box-border flex-grow focus:outline-none nodrag resize overflow-auto min-w-[100px] max-w-[600px]" // Prevents dragging the note when dragging inside the textarea
        rows={5} // Default number of rows
        cols={20} // Default number of columns
        onKeyDown={e => e.stopPropagation()} // Prevent delete/backspace from bubbling up to React Flow
        onWheel={e => {
          e.stopPropagation()
        }} // Prevent scroll wheel from bubbling up to React Flow
      />

      {/* Handle for outgoing connections (right of the note) */}
      {/*TODO: Make the "out" handle 'vibe' when in node is pulled out*/}
      <Handle
        type="source"
        position={Position.Right}
        className='!bg-green-200'
      />
    </div>
  );
}

export default memo(TextNode); // Use memo to prevent unnecessary re-renders