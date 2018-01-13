import format from 'date-fns/format';
import { getFormattedMatchDate } from '../lib/helpers';

const getStatsForMatch = (match) => {
  let stats = {
    p1GamesWon: 0,
    p2GamesWon: 0,
    p1TotalPoints: 0,
    p2TotalPoints: 0,
    p1name: '',
    p2name: '',
    resultString: '',
    pointsWonString: ''
  };

  match.games.forEach(g => {
    stats.p1TotalPoints += g.score1;
    stats.p2TotalPoints += g.score2;
    stats.p1name = g.player1Fname;
    stats.p2name = g.player2Fname;
    if (g.score1 > g.score2) {
      stats.p1GamesWon++;
    } else {
      stats.p2GamesWon++;
    }
  });

  if (stats.p1GamesWon > stats.p2GamesWon) {
    stats.resultString = `${stats.p1name} wins, ${stats.p1GamesWon}-${stats.p2GamesWon}`;
  } else if (stats.p2GamesWon > stats.p1GamesWon) {
    stats.resultString = `${stats.p2name} wins, ${stats.p2GamesWon}-${stats.p1GamesWon}`;
  } else {
    stats.resultString = `Draw, ${stats.p2GamesWon}-${stats.p1GamesWon}`;
  }

  if (stats.p1TotalPoints > stats.p2TotalPoints) {
    stats.pointsWonString = `${stats.p1name} outscored ${stats.p2name} ${stats.p1TotalPoints}-${stats.p2TotalPoints}`;
  } else if (stats.p2TotalPoints > stats.p1TotalPoints) {
    stats.pointsWonString = `${stats.p2name} outscored ${stats.p1name} ${stats.p2TotalPoints}-${stats.p1TotalPoints}`;
  } else {
    stats.pointsWonString = `Total points were even, ${stats.p2TotalPoints}-${stats.p1TotalPoints}`;
  }

  return stats;
};

const BoxScore = ({ match }) => {
  const stats = getStatsForMatch(match);

  return (
    <div class={`scoreboard box-score`}>
      <h4 class="date-time-header">{ getFormattedMatchDate(match) }</h4>
      <div class="header-row flex">
        <span class="player-name"></span>
        {
          match.games.map((g, i) => {
            return (
              <span class={`score-number-box ${g.gameFinished ? 'finished' : 'current'}`}>{i + 1}</span>
            )
          })
        }
      </div>
      <div class="score-row flex">
        <span class="player-name">{ match.games[0].player1Fname } { match.games[0].player1Lname }</span>
        {
          match.games.map(g => {
            return (
              <span class={`score-number-box ${g.gameFinished && g.score1 > g.score2 ? 'win' : 'loss'}`}>{ g.score1 }</span>
            )
          })
        }
      </div>
      <div class="score-row flex">
        <span class="player-name">{ match.games[0].player2Fname } { match.games[0].player2Lname }</span>
        {
          match.games.map(g => {
            return (
              <span class={`score-number-box ${g.gameFinished && g.score2 > g.score1 ? 'win' : 'loss'}`}>{ g.score2 }</span>
            )
          })
        }
      </div>
      <div class="score-row stats-row flex-center">
        <div class="flex-col flex-center">
          <p class="center">{ stats.resultString }</p>
          <p class="font-small center">{ stats.pointsWonString }</p>
        </div>
      </div>
    </div>
  );
};

export default BoxScore;