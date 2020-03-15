import {groupBy, orderBy} from 'lodash';
import {fetchGraphStats, fetchUSTotals} from '../api';
import {
  getTotals,
  getTotalsByDay,
  TotalsMap,
  getCounties,
  startOfUTCDay,
  Totals,
} from './stats';
import {addDays, startOfDay, subDays, isAfter, parse} from 'date-fns/esm';

let usStats;

const getPredictions = (
  totals: TotalsMap,
  length: number,
  initialTotals,
): TotalsMap => {
  const growthRates = [];

  if (totals.size - length < 1) {
    return new Map();
  }

  const minDate = subDays(
    startOfDay(new Date()),
    Math.min(totals.size - length, length),
  );

  let lastTotals = null;
  for (let [date, total] of totals.entries()) {
    if (isAfter(date, minDate)) {
      if (lastTotals) {
        const rate = total.cumulative / lastTotals.cumulative;

        if (rate > 1.0) {
          growthRates.push(rate);
        }
      }

      lastTotals = total;
    }
  }

  const predictionsMap: TotalsMap = new Map();
  for (let i = 0; i < growthRates.length; i++) {
    const date = startOfDay(addDays(new Date(), i + 1));
    const growthRate = growthRates[i];

    const cumulative = Math.floor((lastTotals?.cumulative ?? 0) * growthRate);
    const _totals: Totals = {
      cumulative,
      ongoing: Math.floor((lastTotals?.ongoing ?? 0) * growthRate),
      recover: Math.floor((lastTotals?.recover ?? 0) * growthRate),
      dead: cumulative * 0.014,
      new: Math.floor((lastTotals?.new ?? 0) * growthRate),
      counties: lastTotals?.counties
        ? new Set([...lastTotals.counties])
        : new Set(),
    };
    lastTotals = _totals;
    predictionsMap.set(date, _totals);
  }

  return predictionsMap;
};

const getStats = async region => {
  if (!usStats) {
    const usTotals = await fetchUSTotals('', []);
    if (usTotals) {
      usStats = usTotals.totals;
    }
  }

  const {logs: pins, us, counties} = await fetchGraphStats(
    'graph_stats',
    region,
  );

  if (!pins || !counties) {
    return {
      countsByDay: new Map(),
      dailyTotalsByCounty: {},
      totals: null,
      countyTotals: null,
      counties: {},
      us: false,
    };
  }

  const countyTotals = {};

  const _pins = orderBy(pins, 'order', 'asc');

  const dailyTotalsByCounty: {[key: string]: TotalsMap} = {};
  const projectionsByCounty: {[key: string]: TotalsMap} = {};

  const totals = getTotals(_pins);
  const countsByDay = getTotalsByDay(_pins);

  const usStatsMap = new Map();
  Object.entries(usStats).forEach(entry => {
    const totals = entry[1];

    usStatsMap.set(parse(entry[0], 'yyyy-MM-dd', startOfDay(new Date())), {
      cumulative: totals.confirm,
      dead: totals.dead,
      recover: totals.recover,
    });
  });

  const projections = getPredictions(usStatsMap, 7);
  const mapProjections = getPredictions(countsByDay, 7);

  const pinsByCounty = groupBy(_pins, 'county.id');

  for (const [countyId, pins] of Object.entries(pinsByCounty)) {
    const dayTotals = getTotalsByDay(pins, 14);
    dailyTotalsByCounty[countyId] = dayTotals;
    projectionsByCounty[countyId] = getPredictions(dayTotals, 7);
  }

  return {
    countsByDay,
    dailyTotalsByCounty,
    mapProjections,
    totals,
    countyTotals,
    projectionsByCounty,
    projections,
    counties,
    us,
    usStats,
  };
};

if (typeof self !== 'undefined') {
  self.addEventListener('message', ({data: {type, region}}) => {
    if (type === 'getStats') {
      getStats(region).then(
        resp => {
          self.postMessage({type: 'stats', stats: resp});
        },
        err => {
          console.error(err);
        },
      );
    }
  });
}

export default {} as typeof Worker & (new () => Worker);
