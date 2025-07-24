// src/components/CustomNode.jsx
import { Handle, Position } from '@xyflow/react'; // Handle is for connecting nodes
import { memo } from 'react';
import LinkPill from './LinkPill';

let MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds
const MIN_OPACITY = 0.3; // Minimum opacity for the note


// This component will render our custom node
function CustomNode({ id, data }) {
    // The `data` prop will contain `label` (our note text) and `onTextChange` (a function from App.jsx)
    const ageMs = Date.now() - (data.lastAccessed || 0);
    // const opacity = Math.trunc((Math.max(MIN_OPACITY, 1 - ageMs / MAX_AGE_MS)) * 100); // Calculate opacity based on age
    // console.log('Opacity:', (Math.max(MIN_OPACITY, 1 - ageMs / MAX_AGE_MS)));

    const onTitleChange = (evt) => {
        if (data.onTextChange) {
            data.onTextChange(id, { ...data.label, title: evt.target.value });
        }
    };

    const onBodyChange = (evt) => {
        if (data.onTextChange) {
            data.onTextChange(id, { ...data.label, body: evt.target.value });
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
            <div className='flex flex-col'>
                <input
                    type="text"
                    value={data.label.title}
                    onChange={onTitleChange}
                    className="h1 border-0 outline-0" // Prevents dragging the note when dragging inside the textarea
                    onKeyDown={e => e.stopPropagation()}
                />

                <textarea
                    value={data.label.body} // Display the current text
                    onChange={onBodyChange} // Update text when user types
                    className="border-none bg-transparent text-inherit font-inherit text-[14px] p-0 box-border flex-grow focus:outline-none nodrag resize overflow-auto min-w-[100px] max-w-[600px]" // Prevents dragging the note when dragging inside the textarea
                    rows={5} // Default number of rows
                    cols={20} // Default number of columns
                    onKeyDown={e => e.stopPropagation()} // Prevent delete/backspace from bubbling up to React Flow
                    onWheel={e => {
                        e.stopPropagation()
                    }} // Prevent scroll wheel from bubbling up to React Flow
                />

                {data.label.urls && data.label.urls.length > 0 && (
                    <div className=''>
                        {data.label.urls.map((url, index) => (
                            <LinkPill key={index} url={url} />
                        ))}
                    </div>
                )}
            </div>

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

export default memo(CustomNode); // Use memo to prevent unnecessary re-renders