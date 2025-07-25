import { Handle, Position, useStore, NodeResizer } from '@xyflow/react';
import { memo, useState, useCallback, useRef, useEffect } from 'react';
import LinkPill from './LinkPill';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import {
    MIN_OPACITY,
    MAX_AGE_MS,
    URL_AREA_RATIO,
    BODY_ONLY_HEIGHT_THRESHOLD,
    URL_HEIGHT_THRESHOLD
} from '../configurations';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const useIsConnecting = () => {
    const isConnecting = useStore(
        (s) => s.connectionNodeId !== null || s.connectionStartHandle !== null
    );
    return isConnecting;
};

// function CustomNode({ id, data, selected, width, height }) {
function CustomNode({ id, data, selected, height }) {
    const isConnecting = useIsConnecting();
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const urlAreaRef = useRef(null);
    const textareaRef = useRef(null);

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

    const handleDoubleClick = () => {
        if (!selected) return;
        setIsEditing(true);
    }

    const handleKeyDown = (e) => {
        if (selected && e.key === 'Enter') {
            setIsEditing(true);
        }
    }

    useEffect(() => {
        if (isEditing) {
            textareaRef.current?.focus();
        }
    }, [isEditing]);

    const showBody = height > BODY_ONLY_HEIGHT_THRESHOLD;
    const showUrls = height > URL_HEIGHT_THRESHOLD;

    return (
        <div
            className="p-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 shadow-xl flex flex-col box-border relative transition-all duration-300 group hover:border-purple-500 h-full"
            style={{ opacity }}
            onWheel={(e) => e.stopPropagation()}
        // // 
        // onDoubleClick={handleDoubleClick}
        // onKeyDownCapture={handleKeyDown}
        // tabIndex={0}
        // //

        >
            {/* <NodeResizer isVisible={selected} minWidth={250} minHeight={200} maxWidth={800} maxHeight={1000} /> */}
            <NodeResizer isVisible={selected} minWidth={20} minHeight={40} />
            <Handle
                type="target"
                position={Position.Left}
                className={`w-3 h-3 rounded-full border-2 border-gray-800 !bg-amber-400 transition-all duration-200 ease-in-out hover:scale-150 ${isConnecting ? 'scale-150 shadow-lg shadow-amber-400/50' : ''}`}
            />
            <div
                className="flex flex-col gap-2 h-full overflow-y-auto"
                // 
                onDoubleClick={handleDoubleClick}
                onKeyDownCapture={handleKeyDown}
                tabIndex={0}
            //
            >
                <input
                    type="text"
                    value={data.label.title}
                    onChange={onTitleChange}
                    className="bg-transparent text-lg font-bold outline-none border-none p-0 text-gray-200 flex-shrink-0"
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Node Title"
                />
                {showBody && (
                    <div className="flex-grow relative markdown-body overflow-y-auto">
                        {isEditing ? (
                            <textarea
                                defaultValue={data.label.body}
                                ref={textareaRef}
                                onChange={onBodyChange}
                                onBlur={() => setIsEditing(false)}
                                className="bg-transparent text-sm outline-none border-none p-0 resize-none text-gray-300 absolute top-0 left-0 w-full h-full"
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setIsEditing(false);
                                    }
                                    e.stopPropagation();
                                }}
                                placeholder="Node content..."
                            />
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                    {data.label.body}
                                </Markdown>
                            </div>
                        )}
                    </div>
                )}
                {showUrls && data.label.urls && data.label.urls.length > 0 && (
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