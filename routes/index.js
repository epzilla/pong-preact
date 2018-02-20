const players = require('./players');
const matches = require('./matches');
const devices = require('./devices');
const stats = require('./stats');

module.exports = function (models, app, sequelize, sendSocketMsg, registerForMsg) {
  matches.init(models, sequelize, sendSocketMsg, registerForMsg);
  players.init(models);
  devices.init(models);
  stats.init(models);

  // Players
  app.get('/api/players', players.get);
  app.post('/api/players', players.create);

  // Matches/Games
  app.get('/api/matches/by-players/:player1Id/:player2Id', matches.matchesByPlayers);
  app.get('/api/matches/most-recent/:count', matches.mostRecent);
  app.get('/api/matches/current', matches.current);
  app.get('/api/matches/can-update-score/:deviceId', matches.canUpdate);
  app.get('/api/matches/:id', matches.findById);
  app.post('/api/matches/create', matches.create);
  app.post('/api/matches/finish', matches.finish);
  app.post('/api/matches/add-devices', matches.addDevices);
  app.post('/api/games/add', matches.addGame);
  app.post('/api/games/update', matches.updateGame);

  // Devices
  app.get('/api/devices', devices.get);
  app.post('/api/devices', devices.create);

  // Stats
  app.get('/api/matches-with-players', stats.getMatchesWithPlayers);

  app.get('/*', (req, res) => res.render('index'));
};