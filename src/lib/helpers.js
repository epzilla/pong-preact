import parse from 'date-fns/parse';
import isThisYear from 'date-fns/is_this_year';
import differenceInDays from 'date-fns/difference_in_days'
import distanceInWords from 'date-fns/distance_in_words'
import format from 'date-fns/format';

export const getFormattedMatchDate = (game) => {
  let date = parse(game.finishTime);
  let now = new Date();

  if (differenceInDays(now, date) < 7) {
    return `${format(date, 'dddd')} at ${format(date, 'h:mm')}`;
  }

  if (isThisYear(date)) {
    return format(date, 'M/D');
  }

  return format(date, 'M/D/YY');
};

export const getMatchTimeAgo = (match) => {
  return distanceInWords(new Date(), parse(match.startTime), { includeSeconds: true, addSuffix: true });
};

export const getStatsForMatch = (match) => {
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
