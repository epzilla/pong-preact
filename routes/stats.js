const constants = require('../constants');
let Games;
let Matches;
let Players;
let sequelize;

exports.init = (models, db, sendMsg, registerForMsg) => {
  Games = models.Games;
  Matches = models.Matches;
  Players = models.Players;
  sequelize = db;
};

exports.getMatchesWithPlayers = (req, res) => {
  return Matches.findAll({ include: [ { all: true }]}).then(m => {
    return res.json(m);
  }).catch(err => {
    return res.status(500).send(err);
  });
};