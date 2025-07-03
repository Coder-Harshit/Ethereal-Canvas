// extension/popup.js
document.getElementById('captureSelectedText').addEventListener('click', () => {
  // Execute a script in the active tab to get selected text
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: getSelectedText,
    }, (injectionResults) => {
      if (injectionResults && injectionResults[0] && injectionResults[0].result) {
        sendToCanvas({ text: injectionResults[0].result, url: tabs[0].url, title: tabs[0].title });
      } else {
        showStatus('No text selected.', 'error');
      }
    });
  });
});

document.getElementById('capturePageLink').addEventListener('click', () => {
  // Get current tab's URL and title
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    sendToCanvas({ url: tab.url, title: tab.title });
  });
});

function getSelectedText() {
  // This function runs in the context of the webpage
  return window.getSelection().toString();
}

async function sendToCanvas(data) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = 'Sending...';
  messageDiv.className = 'message';

  try {
    const response = await fetch('http://localhost:3001/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      showStatus('Sent to Ethereal Canvas!', 'message');
      setTimeout(() => window.close(), 1000); // Close popup after a short delay
    } else {
      const errorData = await response.json();
      showStatus(`Error: ${errorData.message || 'Could not connect to Canvas.'}`, 'error');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showStatus('Failed to connect to Canvas. Is the backend server running?', 'error');
  }
}

function showStatus(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = type; // 'message' or 'error'
}