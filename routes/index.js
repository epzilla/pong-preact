module.exports = function (models, app, sequelize) {
  var teams = [];
  const Games = models['Games'];
  const Players = models['Players'];
  const Matches = models['Matches'];

  app.get('/api/players', (req, res) => {
    return Players.findAll().then(p => res.json(p));
  });

  app.get('/api/matches-by-players/:player1Id/:player2Id', (req, res) => {
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
        from matches m
          left outer join games g on g.match_id = m.id
          left outer join players p1 on p1.id = m.player1_id
          left outer join players p2 on p2.id = m.player2_id
        where (p1.id = ${player1Id} and p2.id = ${player2Id}) or (p2.id = ${player1Id} and p1.id = ${player2Id})
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

  app.get('/*', (req, res) => res.render('index'));
};