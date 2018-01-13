import format from 'date-fns/format';
import { getFormattedMatchDate } from '../lib/helpers';

const BoxScore = ({ match }) => {

  return (
    <div class="scoreboard box-score">
      <h4>{ getFormattedMatchDate(match) }</h4>
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
          match.games.map((g, i) => {
            return (
              <span class={`score-number-box ${g.gameFinished && g.score1 > g.score2 ? 'win' : 'loss'}`}>{ g.score1 }</span>
            )
          })
        }
      </div>
      <div class="score-row flex">
        <span class="player-name">{ match.games[0].player2Fname } { match.games[0].player2Lname }</span>
        {
          match.games.map((g, i) => {
            return (
              <span class={`score-number-box ${g.gameFinished && g.score2 > g.score1 ? 'win' : 'loss'}`}>{ g.score2 }</span>
            )
          })
        }
      </div>
    </div>
  );
};

export default BoxScore;