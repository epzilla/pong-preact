let callbacks = {};
let ws = null;
let deviceId = null;
let initialized = false;
let devMode = false;

const fireCallbacks = ({ type, data , originDeviceId }) => {
  if (type && data && callbacks[type] && callbacks[type].length > 0 && (!originDeviceId || originDeviceId !== deviceId)) {
    try {
      let json = JSON.parse(data);
      if (json) {
        if (devMode) {
          console.info(json);
        }
        callbacks[type].forEach(cb => cb(json));
      }
    } catch (e) {
      console.error(e);
    }
  }
};

const WebSocketService = {
  init: (devId, useDevMode) => {
    return new Promise((resolve, reject) => {
      if (initialized) {
        resolve();
      } else {
        deviceId = devId;
        devMode = !!useDevMode;
        try {
          ws = new WebSocket(`ws://${window.location.hostname}:3000`);
          ws.onerror = (e) => console.error(e);
          ws.onopen = () => console.log(`WebSocket connection established for device ID: ${deviceId}`);
          ws.onclose = () => console.log('WebSocket connection closed');
          ws.onmessage = (m) => {
            if (m && m.data) {
              let json = JSON.parse(m.data);
              if (json && json.data) {
                fireCallbacks(json, m.originDeviceId);
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
  },

  setDeviceId: (id) => {
    deviceId = id;
  }
}

export default WebSocketService;