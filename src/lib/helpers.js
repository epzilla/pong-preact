import isBefore from 'date-fns/is_before';
import parse from 'date-fns/parse';
import isThisWeek from 'date-fns/is_this_week';
import isThisYear from 'date-fns/is_this_year';
import format from 'date-fns/format';

let logs = [];

export const getSeason = (year) => {
  return `${year - 1}-${year.toString().slice(-2)}`;
}

export const gamePlayed = (game) => {
  const now = new Date();
  const gameDate = parse(game.playAt);
  return isBefore(gameDate, now);
};

export const getFormattedGameDate = (game) => {
  let date = parse(game.playAt);

  if (isThisWeek(date)) {
    return format(date, 'ddd, H:mm');
  }

  if (isThisYear(date)) {
    return format(date, 'M/D');
  }

  return format(date, 'M/D/YY');
};