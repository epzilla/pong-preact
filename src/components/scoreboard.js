const Scoreboard = ({ match }) => {
  return (
    <div class="scoreboard">
      <div class="header-row flex">
        <span class="player-name">Player</span>
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

export default Scoreboard;