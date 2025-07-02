// src/app.jsx
import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  useReactFlow
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import './App.css'
import TextNode from './components/TextNode';
import '@xyflow/react/dist/style.css';

const LOCAL_STORAGE_NODES_KEY = 'ethereal-canvas-nodes';
const LOCAL_STORAGE_EDGES_KEY = 'ethereal-canvas-edges';

// Inital Nodes
const initalNodes = [
  {
    id: '1',
    position: { x: 100, y: 100 }, // Position on the canvas
    data: {
      value: 'My First Ethereal Note'
    }, // Content of the note
    type: 'textNode',
  }
]

const nodeTypes = {
  textNode: TextNode
}

const initalEdges = []

const getInitialState = (key, defaultState) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultState;
  } catch (err) {
    console.error(`Error retrieving state for key "${key}":`, err);
    return defaultState;
  }
}

function App() {
  // React state to manage nodes and edges
  const [nodes, setNodes] = useState(() => getInitialState(LOCAL_STORAGE_NODES_KEY, initalNodes));
  const [edges, setEdges] = useState(() => getInitialState(LOCAL_STORAGE_EDGES_KEY, initalEdges));
  const instance = useReactFlow(); // Get the React Flow instance

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_NODES_KEY, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EDGES_KEY, JSON.stringify(edges));
  }, [edges]);

  // Callback for when a connection is made (for future linking)
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  // This handles all node changes (dragging, selection, etc.) from React Flow
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  // This specific handler is for when the text inside our custom TextNode changes
  const onNodeTextChange = useCallback((id, newValue) => {
    console.log('Node changes:', newValue);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          // It's important to create a *new* data object to trigger React's re-render
          return { ...node, data: { ...node.data, label: newValue } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addNode = useCallback(() => {
    setNodes((nds) => {
      const newNode = {
        id: uuidv4(), // ID generation
        // position: instance ? instance.screenToFlowPosition({
        //   x: window.innerWidth/2 - 100,
        //   y: window.innerHeight/2 - 50,
        // }) : { x: Math.random() * 500, y: Math.random() * 500 }, // Fallback to Random position
        position: { x: Math.random() * 500, y: Math.random() * 500 }, // Random position
        data: { value: 'New Ethereal Note' },
        type: 'textNode', // Use our custom TextNode type
      };
      return [...nds, newNode];
    });
    setTimeout(() => {
      instance.fitView(); // Fit the view to include the new node
    }, 0);
  }, [setNodes, instance, onNodeTextChange]);

  const onPaste = useCallback((event) => {
    event.preventDefault(); // Prevent default browser paste behavior
    const pastedText = event.clipboardData.getData('text');
    console.log('Pasted text:', pastedText);

    if (pastedText) {
      // Get the current mouse position (where the paste event occurred)
      const flowPosition = instance.screenToFlowPosition({
        // x: event.clientX,
        // y: event.clientY
        x:  Math.random() * 500,
        y: Math.random() * 500, // Random position
      });

      setNodes((nds) => {
        const newNode = {
          id: uuidv4(),
          position: flowPosition, // Place node at paste location
          data: { value: pastedText, label: pastedText, onTextChange: onNodeTextChange },
          type: 'textNode',
        };
        return [...nds, newNode];
      });
    }
  }, [instance, setNodes, onNodeTextChange]); // Add dependencies


  return (
    <div className="App">
      <h1>Ethereal Canvas</h1>
      {/* React Flow container */}
      <div
        style={{ width: '100%', height: '80vh', border: '1px solid #eee' }}
        onPaste={onPaste} // Handle paste events
      >
        <ReactFlow
          nodes={
            nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                onTextChange: onNodeTextChange,
              },
            }))
          }
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={() => { /* This will be used later for more complex edge updates */ }}
          onConnect={onConnect}
          fitView // Zooms to fit all nodes initially
          colorMode='dark'
          nodeTypes={nodeTypes}
        >
          <Controls /> {/* Zoom, pan, fit buttons */}
          <MiniMap /> {/* Small overview map */}
          <Background variant="dots" gap={12} size={1} /> {/* Dotted background */}
        </ReactFlow>
      </div>
      <button onClick={addNode}>Create Node</button>
    </div>
  );
}

export default App;