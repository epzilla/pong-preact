const crypto = require('crypto');

module.exports = function (models, app, sequelize) {
  var teams = [];
  const Games = models['Games'];
  const Players = models['Players'];
  const Matches = models['Matches'];

  const generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  };

  app.get('/api/players', (req, res) => {
    return Players.findAll().then(p => res.json(p));
  });

  app.get('/api/matches-by-players/:player1Id/:player2Id', (req, res) => {
    const player1Id = parseInt(req.params.player1Id);
    const player2Id = parseInt(req.params.player2Id);
    return Promise.all([
      Matches.findAll({
        order: sequelize.literal('date_time DESC'),
        limit: req.params.count
      }),
      sequelize.query(`
        select p1.fname as player1Fname,
          p1.lname as player1Lname,
          p1.id as player1Id,
          p2.fname as player2Fname,
          p2.lname as player2Lname,
          p2.id as player2Id,
          g.score1,
          g.score2,
          m.id as matchId,
          g.id as gameId,
          m.finished as matchFinished,
          g.finished as gameFinished,
          m.date_time as dateTime
        from matches m
          left outer join games g on g.match_id = m.id
          left outer join players p1 on p1.id = m.player1_id
          left outer join players p2 on p2.id = m.player2_id
        where (p1.id = ${player1Id} and p2.id = ${player2Id}) or (p2.id = ${player1Id} and p1.id = ${player2Id})
        order by m.date_time desc`, { type: sequelize.QueryTypes.SELECT}
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
          dateTime: m.dateTime
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
  });

  app.get('/api/most-recent/:count', (req, res) => {
    const player1Id = req.params.player1Id;
    const player2Id = req.params.player2Id;
    return Promise.all([
      Matches.findAll({
        order: sequelize.literal('date_time DESC'),
        limit: req.params.count
      }),
      sequelize.query(`
        select p1.fname as player1Fname,
          p1.lname as player1Lname,
          p1.id as player1Id,
          p2.fname as player2Fname,
          p2.lname as player2Lname,
          p2.id as player2Id,
          g.score1,
          g.score2,
          m.id as matchId,
          g.id as gameId,
          m.finished as matchFinished,
          g.finished as gameFinished,
          m.date_time as dateTime
        from
          (select * from matches m order by date_time limit ${req.params.count}) as m
          join games g on g.match_id = m.id
          join players p1 on m.player1_id = p1.id
          join players p2 on m.player2_id = p2.id
        order by m.date_time desc`, { type: sequelize.QueryTypes.SELECT}
      )
    ]).then(result => {
      let augmentedMatches = result[0].map(m => {
        m['games'] = [];
        return {
          games: [],
          id: m.id,
          player1Id: m.player1Id,
          player2Id: m.player2Id,
          finished: m.finished,
          dateTime: m.dateTime
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
  });

  app.get('/api/current-match', (req, res) => {
    return Promise.all([
      Matches.findOne({
        where: {
          finished: 0
        }
      }),
      sequelize.query(`
        select p1.fname as player1Fname,
          p1.lname as player1Lname,
          p1.id as player1Id,
          p2.fname as player2Fname,
          p2.lname as player2Lname,
          p2.id as player2Id,
          g.score1,
          g.score2,
          m.id as matchId,
          g.id as gameId,
          m.finished as matchFinished,
          g.finished as gameFinished,
          m.date_time as dateTime
        from
          (select * from matches m where finished = 0 order by date_time limit 1) as m
          join games g on g.match_id = m.id
          join players p1 on m.player1_id = p1.id
          join players p2 on m.player2_id = p2.id
        order by m.date_time desc`, { type: sequelize.QueryTypes.SELECT}
      )
    ]).then(result => {
      return res.json({
        games: result[1],
        id: result[0].id,
        player1Id: result[0].player1Id,
        player2Id: result[0].player2Id,
        finished: result[0].finished,
        dateTime: result[0].dateTime
      });
    });
  });

  app.post('/api/new-match', (req, res) => {
    const playersInfo = req.body;
    let token, hashedToken, match, game;
    return Matches.findOne({
      where: {
        finished: 0
      }
    }).then(matchInProgress => {
      if (matchInProgress) {
        return res.send(400);
      }

      return Matches.create({ player1Id: playersInfo.player1.id, player2Id: playersInfo.player2.id });
    }).then(m => {
      match = {
        games: [{
          id: null
        }],
        id: m.id,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        finished: m.finished,
        dateTime: m.dateTime
      };
      token = generateGuid();
      const hash = crypto.createHash('sha256');
      hash.update(token + req.headers['user-agent']);
      hashedToken = hash.digest('hex');
      return Promise.all([
        sequelize.query(`insert into match_key (key, match_id) values ('${hashedToken}', '${m.id}')`, { type: sequelize.QueryTypes.INSERT }),
        sequelize.query(`insert into games (match_id) values ('${m.id}')`, { type: sequelize.QueryTypes.INSERT })
      ]);
    }).then(result => {

      game = {
        id: result[1][0],
        score1: 0,
        score2: 0,
        matchFinished: 0,
        gameFinished: 0,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        player1Fname: playersInfo.player1.fname,
        player2Fname: playersInfo.player1.lname,
        player1Lname: playersInfo.player2.fname,
        player2Lname: playersInfo.player2.lname,
        dateTime: match.dateTime,
      };
      match.games[0] = game;
      return res.json({
        match: match,
        token: token
      });
    });
  });

  app.get('/api/can-update-score/:token', (req, res) => {
    const token = req.params.token;
    const hash = crypto.createHash('sha256');
    hash.update(token + req.headers['user-agent']);
    const hashedToken = hash.digest('hex');
    return sequelize.query(`select match_id from match_key where key = '${hashedToken}'`).then(matchId => {
      res.send(!!matchId);
    });
  });

  app.get('/*', (req, res) => res.render('index'));
};