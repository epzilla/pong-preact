let callbacks = {};
let ws = null;
let initialized = false;

const fireCallbacks = ({ type, data }) => {
  if (type && data && callbacks[type] && callbacks[type].length > 0) {
    try {
      let json = JSON.parse(data);
      if (json) {
        callbacks[type].forEach(cb => cb(json));
      }
    } catch (e) {
      console.error(e);
    }
  }
};

const WebSocketService = {
  init: () => {
    return new Promise((resolve, reject) => {
      if (initialized) {
        resolve();
      } else {
        try {
          ws = new WebSocket(`ws://${window.location.hostname}:3000`);
          ws.onerror = (e) => console.error(e);
          ws.onopen = () => console.log('WebSocket connection established');
          ws.onclose = () => console.log('WebSocket connection closed');
          ws.onmessage = (m) => {
            if (m && m.data) {
              let json = JSON.parse(m.data);
              if (json && json.data) {
                fireCallbacks(json);
              }
            }
          };
          initialized = true;
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    });
  },

  register: (type, cb) => {
    if (callbacks[type]) {
      callbacks[type].push(cb);
    } else {
      callbacks[type] = [cb];
    }
  }
}

export default WebSocketService;