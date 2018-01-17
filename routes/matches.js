const crypto = require('crypto');
const constants = require('../constants');
let SimpleGames;
let Matches;
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
  return sequelize.query(`select match_id from match_key where key = '${hashedToken}'`).then(result => {
    return (result.length > 0 && result[0].length > 0);
  });
};

exports.init = (models, db, ws) => {
  SimpleGames = models.SimpleGames;
  Matches = models.Matches;
  sequelize = db;
  sendSocketMsg = ws;
};

exports.create = (req, res) => {
  const matchInfo = req.body;
  const deviceId = matchInfo.deviceId || req.params.deviceId;
  if (!deviceId) {
    return res.status(400).send(constants.NO_DEVICE_ID);
  }

  let match, game;
  return Matches.findOne({
    where: {
      finished: 0
    }
  }).then(matchInProgress => {
    if (matchInProgress) {
      return res.status(400).send(constants.MATCH_IN_PROGRESS);
    }

    return Matches.create({
      player1Id: matchInfo.player1.id,
      player2Id: matchInfo.player2.id,
      updateEveryPoint: matchInfo.updateEveryPoint,
      bestOf: matchInfo.bestOf || 4,
      playTo: matchInfo.playTo || 21
    });
  }).then(m => {
    match = {
      games: [{
        gameId: null
      }],
      id: m.id,
      player1Id: m.player1Id,
      player2Id: m.player2Id,
      finished: m.finished,
      startTime: m.startTime,
      finishTime: m.finishTime
    };
    const hash = crypto.createHash('sha256');
    hash.update('01a217ea-67bf-' + deviceId + '411a-965e-3e874e15e490');
    const hashedToken = hash.digest('hex');
    return Promise.all([
      sequelize.query(`insert into match_key (key, match_id) values ('${hashedToken}', '${m.id}')`, { type: sequelize.QueryTypes.INSERT }),
      sequelize.query(`insert into games (match_id) values ('${m.id}')`, { type: sequelize.QueryTypes.INSERT })
    ]);
  }).then(result => {

    game = {
      gameId: result[1][0],
      score1: 0,
      score2: 0,
      matchFinished: 0,
      gameFinished: 0,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      player1Fname: matchInfo.player1.fname,
      player1Lname: matchInfo.player2.fname,
      player1MiddleInitial: matchInfo.player2.middleInitial,
      player2Fname: matchInfo.player1.lname,
      player2Lname: matchInfo.player2.lname,
      player2MiddleInitial: matchInfo.player2.middleInitial
    };
    match.games[0] = game;
    sendSocketMsg(constants.MATCH_STARTED, match);
    return res.json({
      match: match,
      deviceId: deviceId
    });
  });
};

exports.canUpdate = (req, res) => {
  return validateMatchToken(req, res).then(result => {
    res.send(result);
  });
};

exports.update = (req, res) => {
  const match = req.body.match;
  return validateMatchToken(req, res).then(result => {
    if (!result) {
      return res.sendStatus(400);
    }

    return Matches.findOne({ where: { id: match.id }});
  }).then(m => {
    m.player1Id = match.player1Id;
    m.player2Id = match.player2Id;
    m.finished = match.finished;
    return m.save();
  }).then(() => {
    return res.json(match);
  }).catch(e => {
    return res.send(500, e);
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
      return sequelize.query(`insert into match_key (key, match_id) values ('${hashedToken}', '${match.id}')`, { type: sequelize.QueryTypes.INSERT });
    });

    return Promise.all(promises);
  }).then(result => {
    let packet = { match, deviceIds: devices.map(dev => dev.id) };
    sendSocketMsg(constants.ADDED_DEVICES_TO_MATCH, packet);
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
    m.player1Id = match.player1Id;
    m.player2Id = match.player2Id;
    m.finished = 1;
    m.finishTime = new Date();
    return m.save();
  })
  .then(() => Matches.findOne({ where: { id: match.id }}))
  .then(updatedMatch => {
    finishedMatch = updatedMatch;
    return sequelize.query(`delete from match_key where match_id='${match.id}'`, { type: sequelize.QueryTypes.DELETE });
  })
  .then(() => {
    sendSocketMsg(constants.MATCH_FINISHED, finishedMatch);
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

      return sequelize.query(`insert into games (match_id) values ('${match.id}')`, { type: sequelize.QueryTypes.INSERT })
    }).then(result => {
      const game = {
        gameId: result[0],
        score1: match.updateEveryPoint ? 0 : 21,
        score2: match.updateEveryPoint ? 0 : 21,
        matchFinished: 0,
        gameFinished: 0,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        player1Fname: oldGame.player1Fname,
        player1Lname: oldGame.player1Lname,
        player1MiddleInitial: oldGame.player1MiddleInitial,
        player2Fname: oldGame.player2Fname,
        player2Lname: oldGame.player2Lname,
        player2MiddleInitial: oldGame.player2MiddleInitial
      };
      sendSocketMsg(constants.GAME_STARTED, game);
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

    return SimpleGames.findOne({ where: { gameId: game.gameId }});
  }).then(g => {
    g.score1 = game.score1;
    g.score2 = game.score2;
    g.gameFinished = game.gameFinished;
    return g.save();
  }).then(() => {
    if (game.gameFinished) {
      sendSocketMsg(constants.GAME_FINISHED, { game });
    } else {
      sendSocketMsg(constants.SCORE_UPDATE, { game, scorer });
    }
    return res.json(game);
  }).catch(e => {
    return res.send(500, e);
  });
};

exports.current = (req, res) => {
  return Promise.all([
    Matches.findOne({
      where: {
        finished: 0
      }
    }),
    sequelize.query(`
      select
        p1.fname as player1Fname,
        p1.lname as player1Lname,
        p1.mi as player1MiddleInitial,
        p1.id as player1Id,
        p2.fname as player2Fname,
        p2.lname as player2Lname,
        p2.mi as player2MiddleInitial,
        p2.id as player2Id,
        g.score1,
        g.score2,
        m.id as matchId,
        g.id as gameId,
        m.finished as matchFinished,
        g.finished as gameFinished,
        m.start_time as startTime,
        m.finish_time as finishTime
      from
        (select * from matches m where finished = 0 order by start_time limit 1) as m
        join games g on g.match_id = m.id
        join players p1 on m.player1_id = p1.id
        join players p2 on m.player2_id = p2.id
      order by m.start_time desc`, { type: sequelize.QueryTypes.SELECT}
    )
  ]).then(result => {
    if (result[0] && result[1]) {
      return res.json({
        games: result[1],
        id: result[0].id,
        player1Id: result[0].player1Id,
        player2Id: result[0].player2Id,
        finished: result[0].finished,
        startTime: result[0].startTime,
        finishTime: result[0].finishTime
      });
    }

    return res.json({});
  }).catch(e => {
    return res.status(400).send(e);
  });
};

exports.mostRecent = (req, res) => {
  return Promise.all([
    Matches.findAll({
      order: sequelize.literal('start_time DESC'),
      limit: req.params.count
    }),
    sequelize.query(`
      select
        p1.fname as player1Fname,
        p1.lname as player1Lname,
        p1.mi as player1MiddleInitial,
        p1.id as player1Id,
        p2.fname as player2Fname,
        p2.lname as player2Lname,
        p2.mi as player2MiddleInitial,
        p2.id as player2Id,
        g.score1,
        g.score2,
        m.id as matchId,
        g.id as gameId,
        m.finished as matchFinished,
        g.finished as gameFinished,
        m.start_time as startTime,
        m.finish_time as finishTime
      from
        (select * from matches m order by start_time limit ${req.params.count}) as m
        join games g on g.match_id = m.id
        join players p1 on m.player1_id = p1.id
        join players p2 on m.player2_id = p2.id
      order by m.start_time desc`, { type: sequelize.QueryTypes.SELECT}
    )
  ]).then(result => {
    let augmentedMatches = result[0].map(m => {
      m.games = [];
      return {
        games: [],
        id: m.id,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        finished: m.finished,
        startTime: m.startTime,
        finishTime: m.finishTime
      };
    });
    let games = result[1];
    games.forEach(g => {
      let match = augmentedMatches.find(m => m.id === g.matchId);
      if (match) {
        match.games.push(g);
      }
    });
    return res.json(augmentedMatches);
  });
};

exports.matchesByPlayers = (req, res) => {
  const player1Id = parseInt(req.params.player1Id);
  const player2Id = parseInt(req.params.player2Id);
  return Promise.all([
    Matches.findAll({
      order: sequelize.literal('start_time DESC'),
      limit: req.params.count
    }),
    sequelize.query(`
      select
        p1.fname as player1Fname,
        p1.lname as player1Lname,
        p1.mi as player1MiddleInitial,
        p1.id as player1Id,
        p2.fname as player2Fname,
        p2.lname as player2Lname,
        p2.mi as player2MiddleInitial,
        p2.id as player2Id,
        g.score1,
        g.score2,
        m.id as matchId,
        g.id as gameId,
        m.finished as matchFinished,
        g.finished as gameFinished,
        m.start_time as startTime,
        m.finish_time as finishTime
      from matches m
        left outer join games g on g.match_id = m.id
        left outer join players p1 on p1.id = m.player1_id
        left outer join players p2 on p2.id = m.player2_id
      where (p1.id = ${player1Id} and p2.id = ${player2Id}) or (p2.id = ${player1Id} and p1.id = ${player2Id})
      order by m.start_time desc`, { type: sequelize.QueryTypes.SELECT}
    )
  ]).then(result => {
    let matchResults = {};
    let statPack = {
      player1Id: player1Id,
      player2Id: player2Id,
      meetings: result[0].length,
      p1MatchesWon: 0,
      p2MatchesWon: 0,
      matchesDrawn: 0,
      p1GamesWon: 0,
      p2GamesWon: 0,
      p1TotalPoints: 0,
      p2TotalPonts: 0
    };
    let augmentedMatches = result[0].map(m => {
      matchResults[m.id] = {
        p1wins: 0,
        p2wins: 0
      };
      return {
        games: [],
        id: m.id,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        finished: m.finished,
        startTime: m.startTime,
        finishTime: m.finishTime
      };
    });

    result[1].forEach(g => {
      let match = augmentedMatches.find(m => m.id === g.matchId);
      if (match) {
        match.games.push(g);
        if (g.player1Id === player1Id) {
          statPack.p1TotalPoints += g.score1;
          statPack.p2TotalPonts += g.score2;
          if (g.score1 > g.score2) {
            statPack.p1GamesWon++;
            matchResults[match.id].p1wins++;
          } else if (g.score2 > g.score1) {
            statPack.p2GamesWon++;
            matchResults[match.id].p2wins++;
          }
        } else {
          statPack.p1TotalPoints += g.score2;
          statPack.p2TotalPonts += g.score1;
          if (g.score1 > g.score2) {
            statPack.p2GamesWon++;
            matchResults[match.id].p2wins++;
          } else if (g.score2 > g.score1) {
            statPack.p1GamesWon++;
            matchResults[match.id].p1wins++;
          }
        }
      }
    });
    Object.keys(matchResults).forEach(matchId => {
      let id = parseInt(matchId);
      if (matchResults[id].p1wins > matchResults[id].p2wins) {
        statPack.p1MatchesWon++;
      }
      else if (matchResults[id].p2wins > matchResults[id].p1wins) {
        statPack.p2MatchesWon++;
      }
      else {
        statPack.matchesDrawn++;
      }
    });
    return res.json({
      matches: augmentedMatches,
      stats: statPack
    });
  });
};