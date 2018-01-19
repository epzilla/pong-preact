# Pong DB
Ping pong score tracker and stats application

## Installation
1. `git clone https://github.com/epzilla/audb.git`
2. `npm install`
3. To run the backend API: `npm run backend`, or to run it in debug mode to allow the user of node devtools, run `npm run backend-debug`.
4. To run the frontend dev environment with webpack: `npm run frontend`

### TODO
- React to socket updates by showing live score updates
- Refactor to allow multiple matches going on at once
- WebSocket robustness. Reconnect, etc.