import {format, parse, startOfDay} from 'date-fns/esm';
import {groupBy, fromPairs} from 'lodash';

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function treatAsUTC(date): Date {
  var result = new Date(date);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
  return result;
}

function daysBetween(startDate: Date, endDate: Date): number {
  var millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

export const startOfUTCDay = date => new Date(date.setUTCHours(0, 0, 0, 0));

const getUTCDate = (dateString = Date.now()) => {
  const date = new Date(dateString);

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
};

export type Totals = {
  cumulative: number;
  new: number;
  ongoing: number;
  recover: number;
  dead: number;
  counties: Set<string>;
};

export type TotalsMap = Map<Date, Totals>;

export const mergeTotals = (first, second): Totals => {
  const cumulative = first.cumulative + second.cumulative;
  const recover = first.recover + second.recover;
  const dead = first.dead + second.dead;
  const _new = first.new + second.new;
  const counties = new Set([
    ...first.counties.entries(),
    ...second.counties.entries(),
  ]);

  return {
    ongoing: cumulative - recover - dead,
    cumulative,
    recover: recover,
    dead: dead,
    new: _new,
    counties,
  };
};

export const getTotals = (pins, lastTotals): Totals => {
  const totals = {
    cumulative: lastTotals?.cumulative ?? 0,
    ongoing: lastTotals?.ongoing ?? 0,
    recover: lastTotals?.recover ?? 0,
    dead: lastTotals?.dead ?? 0,
    new: lastTotals?.new ?? 0,
    counties: lastTotals ? new Set([...lastTotals.counties]) : new Set(),
  };

  for (const pin of pins) {
    totals.cumulative += pin.infections.confirm;
    totals.recover += pin.infections.recover;
    totals.dead += pin.infections.dead;
    totals.new +=
      pin.infections.confirm - pin.infections.dead - pin.infections.recover;
    totals.counties.add(pin.county.id);
  }

  totals.ongoing = totals.cumulative - totals.recover - totals.dead;

  return totals;
};

export const getTotalsByDay = (pins, maxDays = null) => {
  const _logsByDay = groupBy(pins, 'confirmed_at');
  const logsByDay = {};
  let lastLog = null;
  for (const day of Object.keys(_logsByDay)) {
    lastLog = getTotals(_logsByDay[day], lastLog);
    logsByDay[day] = lastLog;
  }

  const countsByDay: TotalsMap = new Map();

  const days = Object.keys(logsByDay)
    .map(day => parse(day, 'yyyy-MM-dd', startOfDay(new Date())))
    .sort(function compare(dateA, dateB) {
      return dateA - dateB;
    });

  if (days.length > 0) {
    const maxDay = days[days.length - 1];
    const minDay = days[0];
    const dayCount = daysBetween(minDay, maxDay) + 1;

    let lastTotals: Totals | null;
    let overflowKeys = [];
    for (let i = 0; i < dayCount; i++) {
      const day = addDays(minDay, i);
      const _day = format(day, 'yyyy-MM-dd');
      const isLastDay = i === dayCount - 1;

      if (logsByDay[_day]) {
        countsByDay.set(day, logsByDay[_day]);
        lastTotals = {...logsByDay[_day]};
        lastTotals.new = 0;
        lastTotals.dead = 0;
        lastTotals.recover = 0;
      } else if (lastTotals) {
        countsByDay.set(day, lastTotals);
      }
    }
  }
  return countsByDay;
};
