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
import '@xyflow/react/dist/style.css';
import {
  POLLING_RATE,
  BACKEND_GET_ENDPOINT,
  LOCAL_STORAGE_NODES_KEY,
  LOCAL_STORAGE_EDGES_KEY,
  SIMILARITY_THRESHOLD,
} from './configurations';

import {
  initalNodes,
  initalEdges

} from './placeholder';
import nodeTypes from './nodetypes';
import { getInitialState } from './utils/InitialState';
import { calculateKeywordSimilarity } from './utils/textProcessing';

const findBestPlacementAndLinks = (newNodeContent, existingNodes, instance) => {
  let bestPosition = instance ? instance.screenToFlowPosition({
    x: window.innerWidth / 2 - 100,
    y: window.innerHeight / 2 - 50
  }) : { x: Math.random() * 500, y: Math.random() * 500 }; // Default fallback

  const suggestedEdges = [];
  let mostSimilarNode = null;
  let maxSimilarity = 0;

  if (newNodeContent && existingNodes.length > 0) {
    // if new node has some content within it and also there is at least one existing node
    for (const node of existingNodes) {
      if (node.data && node.data.value) {
        const similarity = calculateKeywordSimilarity(newNodeContent.body, node.data.value);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mostSimilarNode = node;
        }
        // If similarity is above threshold, suggest a link
        if (similarity >= SIMILARITY_THRESHOLD) {
          suggestedEdges.push({
            id: `e${uuidv4()}`, // Unique ID for the edge
            source: 'NEW_NODE_PLACEHOLDER', // Will replace this with new node's ID
            target: node.id,
            type: 'default', // Or a custom type for automatic links
            // You can add data to edges too if needed, e.g., similarity score
            data: { similarityScore: similarity }
          });
        }
      }
    }
  }

  // Determine the best position
  if (mostSimilarNode && maxSimilarity > 0) {
    // Place near the most similar node with a slight offset
    const offset = { x: -250, y: 0 }; // Place new note to the left of the similar node
    bestPosition = {
      x: mostSimilarNode.position.x + (mostSimilarNode.width || 200) + offset.x, // Use width if available
      y: mostSimilarNode.position.y + offset.y,
    };
  }
  // Otherwise, bestPosition remains the viewport center/random fallback.

  return { position: bestPosition, suggestedEdges: suggestedEdges };
};


const pollForCapture = async (addNewNoteAndLinks, internalIdRef) => {
  // need to poll the backend for captured data
  try {
    const res = await fetch(BACKEND_GET_ENDPOINT);
    if (res.status === 200) {
      const { capturedData } = await res.json();

      let newNodeContent = {
        title: 'Title',
        body: 'My Ethereal Note',
        urls: []
      };
      // inserting new node with captured data
      if (capturedData.text) {
        newNodeContent.title = capturedData.title
        newNodeContent.body = capturedData.text
        newNodeContent.urls.push(capturedData.url)
      } else {
        newNodeContent.title = capturedData.title
        newNodeContent.urls.push(capturedData.url);
      }

      addNewNoteAndLinks(newNodeContent);

      // // fit the view to include the new node
      // setTimeout(() => {
      //   instance.fitView();
      // }, 0);
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

function App() {
  // React state to manage nodes and edges
  const [nodes, setNodes] = useState(() => getInitialState(LOCAL_STORAGE_NODES_KEY, initalNodes));
  const [edges, setEdges] = useState(() => getInitialState(LOCAL_STORAGE_EDGES_KEY, initalEdges));
  const instance = useReactFlow(); // Get the React Flow instance
  //TODO: Implement the undo & redo operation keybind
  const onKeyDown = useCallback((event) => {
    //TODO: Confirm Deletion Popup => *{checkout: https://reactflow.dev/api-reference/types/on-before-delete}*
    if (event.key === 'Delete' || event.key === 'Backspace') {
      setNodes((nds) => nds.filter((node) => !node.selected));
      setEdges((eds) => eds.filter((edge) => !edge.selected));
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_NODES_KEY, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EDGES_KEY, JSON.stringify(edges));
  }, [edges]);

  // This handles all node changes (dragging, selection, etc.) from React Flow
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds).map(
        node => {
          const changedNode = changes.find(c => c.id === node.id);
          if (changedNode && (changedNode.type === 'position' || changedNode.type === 'select')) {
            return {
              ...node,
              data: {
                ...node.data,
                lastAccessed: Date.now(), // Update timestamp
              }
            };
          }
          return node;
        });
      return updatedNodes;
    });
  }, [setNodes]);

  // This handles all edge changes (dragging, selection, etc.) from React Flow
  const onEdgesChange = useCallback((changes) => {
    setEdges((nds) => applyEdgeChanges(changes, nds));
  }, [setEdges]);

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
              value: newValue.body,
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
      localStorage.setItem(LOCAL_STORAGE_EDGES_KEY, JSON.stringify(updatedEdges));
      return updatedEdges;
    });
  }, [setEdges]);

  // Unified function to add a new note with content and potentially link it
  const addNewNoteAndLinks = useCallback((content, positioning_mode = 'auto', autoLink = true, drop_props) => {
    positioning_mode === 'auto' || positioning_mode === 'drop' ? positioning_mode : 'auto';
    setNodes((currentNodes) => {
      // Use the helper to find position and potential links
      let { position: newPosition, suggestedEdges: initialSuggestedEdges } =
        findBestPlacementAndLinks(content, currentNodes, instance);
      // If positioning_mode is 'drop', use provided x_pos and y_pos
      newPosition = positioning_mode === 'drop' ? {
        x: drop_props.x_pos,
        y: drop_props.y_pos
      } : newPosition;
      const newNodeId = uuidv4(); // Generate ID for the new node

      const newNode = {
        id: newNodeId,
        position: newPosition,
        data: {
          value: content.body, // for similarity matching
          label: content,
          onTextChange: onNodeTextChange,
          lastAccessed: Date.now()
        },
        type: 'textNode',

      };

      // Add the new node
      const updatedNodes = [...currentNodes, newNode];
      if (autoLink) {
        // Now add the edges, replacing the placeholder with the actual new node's ID
        setEdges((currentEdges) => {
          const newEdges = initialSuggestedEdges.map(edge => ({
            ...edge,
            source: newNodeId, // Replace placeholder
          }));
          return [...currentEdges, ...newEdges];
        });
      } else if (positioning_mode === 'drop') {
        // If not auto-linking, just add the new node without edges
        setEdges(
          (eds) =>
            eds.concat({
              id: `e${uuidv4()}`,
              source: drop_props.src,
              target: newNodeId
            }),
        );
      }
      return updatedNodes;
    });

    // Optionally fit view to new node (might need a slight delay)
    // setTimeout(() => {
    //   instance.fitView({ nodes: [{ id: newNodeId }], padding: 0.5 });
    // }, 50); // Small delay to ensure node is rendered
  }, [setNodes, setEdges, onNodeTextChange, instance]);


  // Update addNode to use the new unified function
  const addNode = useCallback(() => {
    addNewNoteAndLinks({
      title: 'Header',
      body: 'Ethereal Note',
      urls: ['https://music.youtube.com/watch?v=m3B_RHmUwtM&list=RDAMVMm3B_RHmUwtM']
    }, "auto", true);
  }, [addNewNoteAndLinks]);

  const onPaste = useCallback((event) => {
    if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea') {
      return; // Ignore paste events in input or textarea elements
    }
    event.preventDefault(); // Prevent default browser paste behavior
    const pastedText = event.clipboardData.getData('text');

    if (pastedText) {
      addNewNoteAndLinks({ title: 'Pasted Note', body: pastedText, urls: [] });
    }
  }, [addNewNoteAndLinks]);

  // Ref to store the interval ID so we can clear it later
  const pollingIntervalId = useRef(null);
  // Set up polling on component mount, clear on unmount
  useEffect(() => {
    // Start polling every minute
    pollingIntervalId.current = setInterval(() => {
      // Pass required dependencies to the polling function
      pollForCapture(addNewNoteAndLinks, pollingIntervalId);
    }, POLLING_RATE);

    // Cleanup: clear interval when component unmounts
    return () => {
      if (pollingIntervalId.current) {
        clearInterval(pollingIntervalId.current);
      }
    };
  }, [addNewNoteAndLinks]); // Dependencies for useEffect

  const onConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        let drop_props = {
          x_pos: event.clientX,
          y_pos: event.clientY,
          src: connectionState.fromNode.id
        }
        addNewNoteAndLinks({ title: 'New Note', body: 'New Ethereal Note', urls: [] }, 'drop', false, drop_props);
      }
    },
    [addNewNoteAndLinks],
  );

  // const isValidConnection = (connection) => {
  //   // Only allow connections from a source handle to a target handle
  //   if (!connection.sourceHandle || !connection.targetHandle) return false;

  //   // Prevent self-loop
  //   if (connection.source === connection.target) return false;

  //   return true;
  // }

  return (
    // TODO: Make the viewport controls more natural flowing
    // TODO: add some kind of view port controls help button

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
          onConnectEnd={onConnectEnd}
          fitView // Zooms to fit all nodes initially
          maxZoom={5}
          minZoom={0.5}
          colorMode='dark'
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }} // Hide attribution for pro features
          selectionMode={SelectionMode.Partial}
          preventScrolling={false} // Prevent scrolling when dragging nodes
        // isValidConnection={isValidConnection} // Validate connections
        >
          <Controls /> {/* Zoom, pan, fit buttons */}
          <MiniMap
            zoomable={true}
            pannable={true}
          // nodeColor={(node) => {
          //   if (node.type === 'textNode') {
          //     return '#00ff00'; // Green for text nodes
          //   }
          //   return '#ff0000'; // Red for other nodes
          // }}
          /> {/* Small overview map */}
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