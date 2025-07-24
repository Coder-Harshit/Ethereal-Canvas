import { Handle, Position, useStore, NodeResizer } from '@xyflow/react';
import { memo, useState, useCallback, useRef} from 'react';
import LinkPill from './LinkPill';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const useIsConnecting = () => {
    const isConnecting = useStore(
        (s) => s.connectionNodeId !== null || s.connectionStartHandle !== null
    );
    return isConnecting;
};

const MIN_OPACITY = 0.3;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const URL_AREA_RATIO = 0.4; // 40% of the node height

// function CustomNode({ id, data, selected, width, height }) {
function CustomNode({ id, data, selected, height }) {
    const isConnecting = useIsConnecting();
    const [copied, setCopied] = useState(false);
    const urlAreaRef = useRef(null);

    const ageMs = Date.now() - (data.lastAccessed || 0);
    const opacity = Math.max(MIN_OPACITY, 1 - ageMs / MAX_AGE_MS);

    const onTitleChange = useCallback((evt) => {
        data.onTextChange?.(id, { ...data.label, title: evt.target.value });
    }, [data, id]);

    const onBodyChange = useCallback((evt) => {
        data.onTextChange?.(id, { ...data.label, body: evt.target.value });
    }, [data, id]);

    const handleCopy = useCallback(() => {
        const content = `${data.label.title}\n\n${data.label.body}`;
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [data.label.title, data.label.body]);

    const maxUrlAreaHeight = height ? height * URL_AREA_RATIO : 'auto';

    return (
        <div
            className="p-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 shadow-xl flex flex-col box-border relative transition-all duration-300 group hover:border-purple-500 h-full"
            style={{ opacity }}
            onWheel={(e) => e.stopPropagation()}
        >
            <NodeResizer isVisible={selected} minWidth={250} minHeight={200} maxWidth={800} maxHeight={1000} />
            <Handle
                type="target"
                position={Position.Left}
                className={`w-3 h-3 rounded-full border-2 border-gray-800 !bg-amber-400 transition-all duration-200 ease-in-out hover:scale-150 ${isConnecting ? 'scale-150 shadow-lg shadow-amber-400/50' : ''}`}
            />
            <div className="flex flex-col gap-2 h-full">
                <input
                    type="text"
                    value={data.label.title}
                    onChange={onTitleChange}
                    className="bg-transparent text-lg font-bold outline-none border-none p-0 text-gray-200 flex-shrink-0"
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Node Title"
                />
                <div className="flex-grow relative">
                    <textarea
                        value={data.label.body}
                        onChange={onBodyChange}
                        className="bg-transparent text-sm outline-none border-none p-0 resize-none text-gray-300 absolute top-0 left-0 w-full h-full"
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Node content..."
                    />
                </div>
                {data.label.urls && data.label.urls.length > 0 && (
                    <div 
                        ref={urlAreaRef}
                        className="mt-2 flex flex-col gap-2 flex-shrink-0 overflow-y-auto"
                        style={{ maxHeight: `${maxUrlAreaHeight}px` }}
                    >
                        {data.label.urls.map((url, index) => (
                            <LinkPill key={index} url={url} />
                        ))}
                    </div>
                )}
            </div>
            <button onClick={handleCopy} className="absolute top-2 right-2 p-1 bg-gray-700 rounded-md hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5 text-gray-400" />}
            </button>
            <Handle
                type="source"
                position={Position.Right}
                className={`w-3 h-3 rounded-full border-2 border-gray-800 !bg-teal-400 transition-all duration-200 ease-in-out hover:scale-150 ${isConnecting ? 'scale-150 shadow-lg shadow-teal-400/50' : ''}`}
            />
        </div>
    );
}

export default memo(CustomNode);