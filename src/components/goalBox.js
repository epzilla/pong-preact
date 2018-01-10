const getGoalString = (g) => {
  let str = `${g.minute}'`;
  if (g.owngoal === 't') {
    str += ' (OG)';
  }
  else if (g.penalty === 't') {
    str += ' (P)';
  }
  return str;
};

const GoalBox = ({ goals, team, textColor }) => {
  let scorers = {};
  goals = goals.filter(g => {
    if (g.teamId === team) {
      if (!scorers[g.player.id]) {
        scorers[g.player.id] = `${g.player.name} ${getGoalString(g)}`;
      }
      else {
        scorers[g.player.id] += `, ${getGoalString(g)}`;
      }
      return true;
    }

    return false;
  });
  return (
    <ul class="goal-box">
      {
        Object.keys(scorers).map(playerId => {
          let playerGoalString = scorers[playerId];
          return (
            <li style={`color: ${textColor ? textColor : 'white' }`} class={ textColor ? 'light-bg' : 'dark-bg' }>
              <span class="ball">⚽️</span>
              <span style={`color: ${textColor ? textColor : 'white' }`} class="scorer">{ playerGoalString }</span>
            </li>
          )
        })
      }
    </ul>
  );
};

export default GoalBox;