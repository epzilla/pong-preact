import isBefore from 'date-fns/is_before';
import parse from 'date-fns/parse';
import isThisWeek from 'date-fns/is_this_week';
import isThisYear from 'date-fns/is_this_year';
import differenceInDays from 'date-fns/difference_in_days'
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