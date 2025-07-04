// src/app.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  useReactFlow,
  SelectionMode,
  applyEdgeChanges,
  Panel
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

  const onKeyDown = useCallback((event) => {
    // console.log('Edges', edges);
    if (event.key === 'Delete' || event.key === 'Backspace') {
      setNodes((nds) => nds.filter((node) => !node.selected));
      setEdges((eds) => eds.filter((edge) => !edge.selected));
    }
  }, [setNodes, setEdges]);

  // useEffect(() => {
  //   console.log('Updated Edges:', edges);
  // }, [edges]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_NODES_KEY, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EDGES_KEY, JSON.stringify(edges));
  }, [edges]);

  // This handles all node changes (dragging, selection, etc.) from React Flow
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  // This handles all edge changes (dragging, selection, etc.) from React Flow
  const onEdgesChange = useCallback((changes) => {
    setEdges((nds) => applyEdgeChanges(changes, nds));
  }, [setEdges]);

  // This specific handler is for when the text inside our custom TextNode changes
  const onNodeTextChange = useCallback((id, newValue) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          // It's important to create a *new* data object to trigger React's re-render
          return {
            ...node,
            data: {
              ...node.data,
              label: newValue,
              lastAccessed: Date.now() // Update last accessed time
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Callback for when a connection is made (for future linking)
  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const updatedEdges = addEdge(params, eds);
      // console.log('Edges after connect:', updatedEdges);
      localStorage.setItem(LOCAL_STORAGE_EDGES_KEY, JSON.stringify(updatedEdges));
      return updatedEdges;
    });
  }, [setEdges]);

  const addNode = useCallback(() => {
    setNodes((nds) => {
      const newNode = {
        id: uuidv4(), // ID generation
        // position: instance ? instance.screenToFlowPosition({
        //   x: window.innerWidth/2 - 100,
        //   y: window.innerHeight/2 - 50,
        // }) : { x: Math.random() * 500, y: Math.random() * 500 }, // Fallback to Random position
        position: { x: Math.random() * 500, y: Math.random() * 500 }, // Random position
        data: {
          value: 'New Ethereal Note',
          lastAccessed: Date.now(), // Track when this node was last accessed
        },
        type: 'textNode', // Use our custom TextNode type
      };
      console.log("Node:", newNode);
      return [...nds, newNode];
    });
    setTimeout(() => {
      instance.fitView(); // Fit the view to include the new node
    }, 0);
  }, [setNodes, instance, onNodeTextChange]);

  const onPaste = useCallback((event) => {
    if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea') {
      return; // Ignore paste events in input or textarea elements
    }
    event.preventDefault(); // Prevent default browser paste behavior
    const pastedText = event.clipboardData.getData('text');
    console.log('Pasted text:', pastedText);

    if (pastedText) {
      // Get the current mouse position (where the paste event occurred)
      const flowPosition = instance.screenToFlowPosition({
        // x: event.clientX,
        // y: event.clientY
        x: Math.random() * 500,
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
  }, [instance, setNodes, onNodeTextChange]);

  const pollForCapture = async (setNodes, onNodeTextChange, instance, internalIdRef) => {
    // need to poll the backend for captured data
    try {
      const res = await fetch('http://localhost:3001/get-capture');
      if (res.status===200) {
        const { capturedData } = await res.json();
        // console.log('Captured Data:', capturedData);

        let newNodeContent = '';
        // inserting new node with captured data
        if (capturedData.text) {
          newNodeContent = capturedData.title + '\n\n' + capturedData.text + '\n\n' + capturedData.url;
        } else {
          newNodeContent = capturedData.title + '\n\n' + capturedData.url;
        }
        console.log(newNodeContent);

        setNodes((nds) => {
          const newNode = {
            id: uuidv4(),
            position: { x: Math.random() * 500, y: Math.random() * 500 }, // Random position
            data: {
              value: newNodeContent,
              label: newNodeContent,
              onTextChange: onNodeTextChange,
              lastAccessed: Date.now(), // Track when this node was last accessed
            },
            type: 'textNode',
          }
          return [...nds, newNode];
        });

        // fit the view to include the new node
        setTimeout(() => {
          instance.fitView();
        }, 0);


      } else if (res.status === 204) {
        // No content
      } else {
        console.error('Error fetching captured data:', res.status);
      }
    } catch (error) {
      console.error('Error during polling:', error);
      if (internalIdRef && internalIdRef.current) {
        clearInterval(internalIdRef.current);
        internalIdRef.current = null;
        console.warn('Stopped polling for captured notes. Local API server might be down.');
      }
    }
  };

  // Ref to store the interval ID so we can clear it later
  const pollingIntervalId = useRef(null);
  // Set up polling on component mount, clear on unmount
  useEffect(() => {
    // Start polling every minute
    pollingIntervalId.current = setInterval(() => {
      // Pass required dependencies to the polling function
      pollForCapture(setNodes, onNodeTextChange, instance, pollingIntervalId);
    }, 1000 * 60);

    // Cleanup: clear interval when component unmounts
    return () => {
      if (pollingIntervalId.current) {
        clearInterval(pollingIntervalId.current);
      }
    };
  }, [setNodes, onNodeTextChange, instance]); // Dependencies for useEffect

  return (
    <div className="App">
      {/* <div className='flex justify-center items-center p-4 bg-transparent'> */}
      <div className='header-overlay'>
        <h1>Ethereal Canvas</h1>
      </div>
      {/* React Flow container */}
      <div
        className='canvas-container'
        onPaste={onPaste} // Handle paste events
        onKeyDown={onKeyDown} // Handle keydown events for delete/backspace
        tabIndex={0} // Make the div focusable to capture key events
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
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView // Zooms to fit all nodes initially
          maxZoom={5}
          minZoom={0.5}
          colorMode='dark'
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }} // Hide attribution for pro features
          selectionMode={SelectionMode.Partial}
          preventScrolling={false} // Prevent scrolling when dragging nodes
>
          <Controls /> {/* Zoom, pan, fit buttons */}
          <MiniMap /> {/* Small overview map */}
          <Background variant="dots" gap={12} size={1} /> {/* Dotted background */}
          {/* <Panel position="top-right" className="bg-transparent text-[#eee] p-2 rounded shadow-lg"> */}
          <Panel position="top-right" className="bg-transparent p-2">
            {/* <button onClick={addNode} className='bg-[#141414]'>Create Node</button> */}
            <button onClick={addNode} className='bg-black bg-opacity-30 hover:bg-opacity-50 text-white px-4 py-2 rounded pointer-events-auto'>Create Node</button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;