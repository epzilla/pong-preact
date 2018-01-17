export default class WebSocketService {
  constructor() {
    this.callbacks = {};
    this.ws = null;
    this.initialized = false;
  }

  init = () => {
    return new Promise((resolve, reject) => {
      if (this.initialized) {
        resolve();
      } else {
        try {
          this.ws = new WebSocket(`ws://${window.location.hostname}:3000`);
          this.ws.onerror = (e) => console.error(e);
          this.ws.onopen = () => console.log('WebSocket connection established');
          this.ws.onclose = () => console.log('WebSocket connection closed');
          this.ws.onmessage = (m) => {
            if (m && m.data) {
              let json = JSON.parse(m.data);
              if (json && json.data) {
                this.fireCallbacks(json);
              }
            }
          };
          this.initialized = true;
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    });
  };

  fireCallbacks = ({ type, data }) => {
    if (type && data && this.callbacks[type] && this.callbacks[type].length > 0) {
      try {
        let json = JSON.parse(data);
        if (json) {
          this.callbacks[type].forEach(cb => cb(json));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  register = (type, cb) => {
    if (this.callbacks[type]) {
      this.callbacks[type].push(cb);
    } else {
      this.callbacks[type] = [cb];
    }
  };
}