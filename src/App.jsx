// src/app.jsx
import { useState, useCallback } from 'react';
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

function App() {
  // React state to manage nodes and edges
  const [nodes, setNodes] = useState(initalNodes);
  const [edges, setEdges] = useState(initalEdges);
  const instance = useReactFlow(); // Get the React Flow instance


  // Callback for when a connection is made (for future linking)
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  // This handles all node changes (dragging, selection, etc.) from React Flow
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  // This specific handler is for when the text inside our custom TextNode changes
  const onNodeTextChange = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          // It's important to create a *new* data object to trigger React's re-render
          return { ...node, data: { ...node.data, label: newLabel } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addNode = useCallback(() => {
    setNodes((nds) => {
      const newNode = {
        id: uuidv4(), // ID generation
        position: { x: Math.random() * 500, y: Math.random() * 500 }, // Random position
        data: { label: 'New Ethereal Note' },
        type: 'default',
      };
      return [...nds, newNode];
    });
    setTimeout(() => {
      instance.fitView(); // Fit the view to include the new node
    }, 0);
  }, [setNodes]);

  return (
    <div className="App">
      <h1>Ethereal Canvas</h1>
      {/* React Flow container */}
      <div style={{ width: '100%', height: '80vh', border: '1px solid #eee' }}>
        <ReactFlow
          nodes={
            nodes.map(node => ({
              ...node,
              data:{
                ...node.data,
                onTextChange: onNodeTextChange,
              },
            }))
          }
          edges={edges}
          onNodesChange={ onNodesChange }
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