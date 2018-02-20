const constants = require('../constants');
let Games;
let Matches;
let Players;
let sequelize;
let Op;

exports.init = (models, db) => {
  Games = models.Games;
  Matches = models.Matches;
  Players = models.Players;
  sequelize = db;
  Op = db.Op;
};

exports.matchesByPlayers = (req, res) => {
  const player1Id = parseInt(req.params.player1Id);
  const player2Id = parseInt(req.params.player2Id);
  return Matches.findAll({
    include: [{ all: true }],
    order: [[{ model: Games, as: 'games' }, 'gameNum', 'ASC']],
    where: {
      [Op.or]: [
        {
          [Op.and]: [
            { player1Id: player1Id },
            { player2Id: player2Id }
          ]
        },
        {
          [Op.and]: [
            { player1Id: player2Id },
            { player2Id: player1Id }
          ]
        }
      ]
    }
  })
  .then(matches => {
    let statPack = {
      player1: {
        player: matches[0].player1,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        gamesWon: 0,
        gamesLost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        avgPointsFor: 0,
        avgPointsAgainst: 0,
        avgMargin: 0,
        perGame: []
      },
      player2: {
        player: matches[0].player2,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        gamesWon: 0,
        gamesLost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        avgPointsFor: 0,
        avgPointsAgainst: 0,
        avgMargin: 0,
        perGame: []
      },
      matches: matches
    };

    matches.forEach(m => {
      let p1wins = 0;
      let p2wins = 0;
      let p1losses = 0;
      let p2losses = 0;
      let p1Points = 0;
      let p2Points = 0;
      let p1 = m.player1Id === statPack.player1.player.id ? statPack.player1 : statPack.player2;
      let p2 = m.player2Id === statPack.player1.player.id ? statPack.player1 : statPack.player2;
      m.games.forEach(g => {
        p1Points += g.score1;
        p2Points += g.score2;
        if (g.score1 > g.score2) {
          p1wins++;
          p2losses++;
        } else {
          p2wins++;
          p1losses++;
        }

        let p1Avgs = p1.perGame.find(av => av.gameNum === g.gameNum);
        let p2Avgs = p2.perGame.find(av => av.gameNum === g.gameNum);
        if (!p1Avgs) {
          p1.perGame.push({
            gameNum: g.gameNum,
            pointsFor: g.score1,
            pointsAgainst: g.score2,
            avgPointsFor: g.score1,
            avgPointsAgainst: g.score2,
            avgMargin: g.score1 - g.score2,
            games: 1
          });
        } else {
          p1Avgs.games++;
          p1Avgs.pointsFor += g.score1;
          p1Avgs.pointsAgainst += g.score2;
          p1Avgs.avgPointsFor = parseFloat((p1Avgs.pointsFor / p1Avgs.games).toFixed(2));
          p1Avgs.avgPointsAgainst = parseFloat((p1Avgs.pointsAgainst / p1Avgs.games).toFixed(2));
          p1Avgs.avgMargin = parseFloat((p1Avgs.avgPointsFor - p1Avgs.avgPointsAgainst).toFixed(2));
        }

        if (!p2Avgs) {
          p2.perGame.push({
            gameNum: g.gameNum,
            pointsFor: g.score2,
            pointsAgainst: g.score1,
            avgPointsFor: g.score2,
            avgPointsAgainst: g.score1,
            avgMargin: g.score2 - g.score1,
            games: 1
          });
        } else {
          p2Avgs.games++;
          p2Avgs.pointsFor += g.score2;
          p2Avgs.pointsAgainst += g.score1;
          p2Avgs.avgPointsFor = parseFloat((p2Avgs.pointsFor / p2Avgs.games).toFixed(2));
          p2Avgs.avgPointsAgainst = parseFloat((p2Avgs.pointsAgainst / p2Avgs.games).toFixed(2));
          p2Avgs.avgMargin = parseFloat((p2Avgs.avgPointsFor - p2Avgs.avgPointsAgainst).toFixed(2));
        }
      });

      let winner = p1wins > p2wins ? m.player1Id : (p2wins > p1wins ? m.player2Id : null);
      if (winner && winner === m.player1Id) {
        p1.matchesWon++;
        p2.matchesLost++;
      }
      else if (winner && winner === m.player2Id) {
        p2.matchesWon++;
        p1.matchesLost++;
      }
      else {
        p1.matchesDrawn++;
        p2.matchesDrawn++;
      }

      p1.pointsFor += p1Points;
      p2.pointsFor += p2Points;
      p1.pointsAgainst += p2Points;
      p2.pointsAgainst += p1Points;
      p1.gamesWon += p1wins;
      p2.gamesWon += p2wins;
      p1.gamesLost += p2wins;
      p2.gamesLost += p1wins;
    });

    statPack.player1.avgPointsFor = parseFloat((statPack.player1.pointsFor / (statPack.player1.gamesWon + statPack.player1.gamesLost)).toFixed(2));
    statPack.player2.avgPointsFor = parseFloat((statPack.player2.pointsFor / (statPack.player2.gamesWon + statPack.player2.gamesLost)).toFixed(2));
    statPack.player1.avgPointsAgainst = parseFloat((statPack.player1.pointsAgainst / (statPack.player1.gamesWon + statPack.player1.gamesLost)).toFixed(2));
    statPack.player2.avgPointsAgainst = parseFloat((statPack.player2.pointsAgainst / (statPack.player2.gamesWon + statPack.player2.gamesLost)).toFixed(2));
    statPack.player1.avgMargin = parseFloat((statPack.player1.avgPointsFor - statPack.player1.avgPointsAgainst).toFixed(2));
    statPack.player2.avgMargin = parseFloat((statPack.player2.avgPointsFor - statPack.player2.avgPointsAgainst).toFixed(2));
    res.json(statPack);
  })
  .catch(err => res.status(500).send(err));
};