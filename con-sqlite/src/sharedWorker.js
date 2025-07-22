// shared-worker.js

let ports = [];
let currentActiveId = null;

onconnect = function(e) {
  const port = e.ports[0];
  ports.push(port);

  port.onmessage = function(event) {
    const { type, tabId } = event.data;

    if (type === 'focus') {
      currentActiveId = tabId;
      broadcast({ type: 'active-tab', tabId });
    } else if (type === 'disconnect') {
      ports = ports.filter(p => p !== port);
    }
  };

  if (currentActiveId) {
    port.postMessage({ type: 'active-tab', tabId: currentActiveId });
  }
};

function broadcast(message) {
  ports.forEach(port => port.postMessage(message));
}
