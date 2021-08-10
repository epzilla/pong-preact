const crypto = require('crypto');
const constants = require('../constants');
let Games;
let Matches;
let Players;
let sequelize;
let sendSocketMsg;

const validateMatchToken = (req, res) => {
  const deviceId = req.body.deviceId || req.params.deviceId;
  if (!deviceId) {
    return Promise.reject(constants.DEVICE_CANNOT_UPDATE_MATCH);
  }
  const hash = crypto.createHash('sha256');
  hash.update('01a217ea-67bf-' + deviceId + '411a-965e-3e874e15e490');
  const hashedToken = hash.digest('hex');
  return sequelize.query(`select match_id from match_key where id = '${hashedToken}'`).then(result => {
    return (result.length > 0 && result[0].length > 0);
  });
};

const augmentMatch = (m, players) => {
  let match = m.get({ plain: true });
  let player1 = players.find(p => p.id === match.player1Id);
  let player2 = players.find(p => p.id === match.player2Id);
  let partner1 = match.partner1Id ? players.find(p => p.id === match.partner1Id) : null;
  let partner2 = match.partner2Id ? players.find(p => p.id === match.partner2Id) : null;
  let augMatch = Object.assign({
    player1Fname: player1.fname,
    player1Lname: player1.lname,
    player1MiddleInitial: player1.middleInitial,
    player2Fname: player2.fname,
    player2Lname: player2.lname,
    player2MiddleInitial: player2.middleInitial,
    partner1Fname: partner1 ? partner1.fname : null,
    partner1Lname: partner1 ? partner1.lname : null,
    partner1MiddleInitial: partner1 ? partner1.middleInitial : null,
    partner2Fname: partner2 ? partner2.fname : null,
    partner2Lname: partner2 ? partner2.lname : null,
    partner2MiddleInitial: partner2 ? partner2.middleInitial : null
  }, match);
  return augMatch;
};

const augmentGame = (g, match) => {
  let game = g.get({ plain: true });
  let augGame = Object.assign({
    player1Id: match.player1Id,
    player2Id: match.player2Id,
    partner1Id: match.partner1Id,
    partner2Id: match.partner2Id,
    player1Fname: match.player1Fname,
    player1Lname: match.player1Lname,
    player1MiddleInitial: match.player1MiddleInitial,
    player2Fname: match.player2Fname,
    player2Lname: match.player2Lname,
    player2MiddleInitial: match.player2MiddleInitial,
    partner1Fname: match.partner1Fname,
    partner1Lname: match.partner1Lname,
    partner1MiddleInitial: match.partner1MiddleInitial,
    partner2Fname: match.partner2Fname,
    partner2Lname: match.partner2Lname,
    partner2MiddleInitial: match.partner2MiddleInitial
  }, game);
  return augGame;
};

exports.init = (models, db, sendMsg) => {
  Games = models.Games;
  Players = models.Players;
  Matches = models.Matches;
  sequelize = db;
  sendSocketMsg = sendMsg;
};

exports.findById = (req, res) => {
  return Matches.findById(req.params.id, { include: [{ all: true }]}).then(match => {
    return res.json(match || {});
  });
};

exports.create = (req, res) => {
  const matchInfo = req.body;
  const deviceId = matchInfo.deviceId || req.params.deviceId;
  if (!deviceId) {
    return res.status(400).send(constants.NO_DEVICE_ID);
  }
  let newMatch;

  return new Promise((resolve, reject) => {
    Matches.findOne({
      where: {
        finished: 0
      }
    }).then(matchInProgress => {
      if (matchInProgress) {
        newMatch = matchInProgress.get({ plain: true });
        sendSocketMsg(constants.MATCH_STARTED, newMatch, deviceId);
        resolve(res.json({
          match: newMatch,
          deviceId: deviceId
        }));
      } else {
        Matches.create({
          player1Id: matchInfo.player1.id,
          player2Id: matchInfo.player2.id,
          partner1Id: matchInfo.partner1 ? matchInfo.partner1.id : null,
          partner2Id: matchInfo.partner2 ? matchInfo.partner2.id : null,
          doubles: matchInfo.doubles,
          updateEveryPoint: matchInfo.updateEveryPoint,
          bestOf: matchInfo.bestOf || 4,
          playTo: matchInfo.playTo || 21,
          winByTwo: matchInfo.winByTwo || 1,
          playAllGames: matchInfo.playAllGames || 0
        }).then(m => {
          return Matches.findById(m.id, { include: [{ all: true }] });
        }).then(startedMatch => {
          newMatch = startedMatch.get({ plain: true });
          const hash = crypto.createHash('sha256');
          hash.update('01a217ea-67bf-' + deviceId + '411a-965e-3e874e15e490');
          const hashedToken = hash.digest('hex');
          const initialScore = startedMatch.updateEveryPoint ? 0 : startedMatch.playTo;
          return Promise.all([
            sequelize.query(`insert into match_key (id, match_id) values ('${hashedToken}', '${newMatch.id}')`, { type: sequelize.QueryTypes.INSERT }),
            sequelize.query(`insert into games (match_id, score1, score2, game_num) values ('${newMatch.id}', ${initialScore}, ${initialScore}, 1)`, { type: sequelize.QueryTypes.INSERT })
          ]);
        }).then(() => {
          return Games.findOne({ where: { matchId: newMatch.id }});
        }).then(g => {
          newMatch.games[0] = g;
          sendSocketMsg(constants.MATCH_STARTED, newMatch, deviceId);
          resolve(res.json({
            match: newMatch,
            deviceId: deviceId
          }));
        });
      }
    })
  });
};

exports.canUpdate = (req, res) => {
  return validateMatchToken(req, res).then(result => {
    res.send(result);
  });
};

exports.addDevices = (req, res) => {
  const match = req.body.match;
  const devices = req.body.devices;
  return validateMatchToken(req, res).then(result => {
    if (!result) {
      return res.sendStatus(400);
    }

    let promises = devices.map(d => {
      const hash = crypto.createHash('sha256');
      hash.update('01a217ea-67bf-' + d.id + '411a-965e-3e874e15e490');
      const hashedToken = hash.digest('hex');
      return sequelize.query(`insert into match_key (id, match_id) values ('${hashedToken}', '${match.id}')`, { type: sequelize.QueryTypes.INSERT });
    });

    return Promise.all(promises);
  }).then(result => {
    let packet = { match, deviceIds: devices.map(dev => dev.id) };
    sendSocketMsg(constants.ADDED_DEVICES_TO_MATCH, packet, req.body.deviceId);
    return res.json(packet);
  }).catch(e => {
    return res.status(500).send(e);
  });
};

exports.finish = (req, res) => {
  const match = req.body.match;
  let finishedMatch;
  return validateMatchToken(req, res).then(result => {
    if (!result) {
      return res.sendStatus(400);
    }

    return Matches.findOne({ where: { id: match.id }});
  })
  .then(m => {
    m.finished = 1;
    m.finishTime = new Date();
    return m.save();
  })
  .then(() => Matches.findOne({
    where: { id: match.id },
    include: [{ all: true }]
  }))
  .then(updatedMatch => {
    finishedMatch = updatedMatch;
    sequelize.query(`delete from match_key where match_id='${finishedMatch.id}'`, { type: sequelize.QueryTypes.DELETE });
    sendSocketMsg(constants.MATCH_FINISHED, finishedMatch, req.body.deviceId);
    res.json(finishedMatch);
  })
  .catch(e => {
    return res.send(500, e);
  });
};

exports.addGame = (req, res) => {
  try {
    const match = req.body.match;
    const oldGame = match.games[match.games.length - 1];
    return validateMatchToken(req, res).then(result => {
      if (!result) {
        return res.sendStatus(400);
      }

      let newGame = {
        matchId: match.id,
        score1: match.updateEveryPoint ? 0 : match.playTo,
        score2: match.updateEveryPoint ? 0 : match.playTo,
        matchFinished: 0,
        gameFinished: 0,
        gameNum: oldGame.gameNum + 1
      };
      return Games.create(newGame);
    }).then(game => {
      sendSocketMsg(constants.GAME_STARTED, game, req.body.deviceId);
      res.json(game);
    });
  } catch (e) {
    res.sendStatus(500);
  }
};

exports.updateGame = (req, res) => {
  const game = req.body.game;
  const scorer = req.body.scorer;
  return validateMatchToken(req, res).then(result => {
    if (!result) {
      return res.sendStatus(400);
    }

    return Games.findOne({ where: { id: game.id }});
  }).then(g => {
    g.score1 = game.score1;
    g.score2 = game.score2;
    g.gameFinished = game.gameFinished;
    return g.save();
  }).then(() => {
    return Matches.findById(game.matchId);
  }).then(m => {
    if (game.gameFinished) {
      sendSocketMsg(constants.GAME_FINISHED, { game }, req.body.deviceId);
    } else if (m.updateEveryPoint) {
      sendSocketMsg(constants.SCORE_UPDATE, { game, scorer }, req.body.deviceId);
    }
    return res.json(game);
  }).catch(e => {
    return res.send(500, e);
  });
};

exports.current = (req, res) => {
  return Matches.findOne({
    where: { finished: 0 },
    include: [{ all: true }],
    order: [[{ model: Games, as: 'games' }, 'gameNum', 'ASC']]
  })
  .then(match => res.json(match || {}))
  .catch(err => res.status(500).send(err));
};

exports.mostRecent = (req, res) => {
  return Matches.findAll({
    order: [['startTime', 'DESC'], [{ model: Games, as: 'games' }, 'gameNum', 'ASC']],
    limit: req.params.count,
    include: [{ all: true }]
  })
  .then(matches => res.json(matches || {}))
  .catch(err => res.status(500).send(err));
};