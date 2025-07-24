const initalNodes = [
  {
    id: '1',
    position: { x: 100, y: 100 }, // Position on the canvas
    data: {
      // value: 'My First Ethereal Note'
      value: {
        title: 'Header',
        body: 'My First Ethereal Note',
        urls: []
      },
    }, // Content of the note
    type: 'textNode',
  }
]

const initalEdges = []

export {
    initalNodes,
    initalEdges
};