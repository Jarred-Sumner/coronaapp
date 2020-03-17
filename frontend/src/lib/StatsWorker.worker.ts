import {addDays, isAfter, parse, startOfDay, subDays} from 'date-fns/esm';
import {fromPairs, groupBy, orderBy} from 'lodash';
import {fetchGraphStats, fetchUSTotals} from '../api';
import {
  getCountryTotals,
  getCountryTotalsByDay,
  getTotalForCountry,
  getTotals,
  getTotalsByDay,
  getVisibleCountries,
  mergeTotals,
  getCountryGrowth,
} from './stats';
import {Totals, TotalsMap} from './Totals';

let usStats;

const getGrowthRates = (totals: TotalsMap, length: number): TotalsMap => {
  const growthRates = new Map();

  if (totals.size - length < 1) {
    return new Map();
  }

  const daysAgo = length;

  let lastDate = subDays(startOfDay(new Date()), daysAgo);

  let lastTotals = null;
  for (let [date, total] of totals.entries()) {
    if (isAfter(date, lastDate)) {
      if (lastTotals) {
        const rate = total.cumulative / lastTotals.cumulative;

        growthRates.set(date, {cumulative: rate});
      }

      lastTotals = total;
      lastDate = date;
    }
  }

  console.log({daysAgo, growthRates, totals});

  return growthRates;
};

const getPredictions = (totals: TotalsMap, length: number): TotalsMap => {
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

    const _cumulative = Math.floor((lastTotals?.cumulative ?? 0) * growthRate);

    const cumulative = isFinite(_cumulative)
      ? _cumulative
      : lastTotals?.cumulative ?? 0;

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

  if (predictionsMap.size !== length && predictionsMap.size > 0) {
    const dates = [...predictionsMap.keys()];
    const referenceDate = dates[0];
    for (let i = 0; length - predictionsMap.size > 0; i++) {
      predictionsMap.set(
        subDays(referenceDate, i),
        predictionsMap.get(referenceDate),
      );
    }
  }

  return predictionsMap;
};

let usStatsMap: TotalsMap | null = null;

const getGlobalStats = (countries, region) => {
  let totals = getCountryTotals(countries);

  if (countries.includes('US')) {
    if (usStats) {
      const usDays = [...usStatsMap.keys()];
      const lastUSTotals = usStatsMap.get(usDays[usDays.length - 1]);
      if (lastUSTotals) {
        totals = mergeTotals(totals, lastUSTotals);
      }
    }
  }

  const alwaysCountries =
    region.zoom < 10 ? ['Italy', 'United Kingdom', 'US'] : [];
  const metricsCountries = new Set([...countries, ...alwaysCountries]);

  const countsByDay = getCountryTotalsByDay(countries, usStatsMap);
  const mapProjections = getPredictions(countsByDay, 7);

  const projectionsByCountry = {};
  const growthRatesByCounty = {};
  const projections = getPredictions(usStatsMap, 9);

  const dailyTotalsByCountry = {};
  for (const country of metricsCountries) {
    const dayTotals =
      country !== 'US' ? getTotalForCountry(country) : usStatsMap;
    dailyTotalsByCountry[country] = dayTotals;
    if (country !== 'China') {
      projectionsByCountry[country] = getPredictions(dayTotals, 9);
    }

    if (country === 'US') {
      growthRatesByCounty[country] = getGrowthRates(dayTotals, 14);
    } else {
      growthRatesByCounty[country] = new Map(
        Object.entries(
          getCountryGrowth(country),
        ).map(([dateString, totals]) => [
          parse(dateString, 'M/d/yy', startOfDay(new Date())),
          totals,
        ]),
      );
    }
  }

  return {
    totals,
    countsByDay,
    mapProjections,
    mode: 'global',
    projections,
    counties: fromPairs(
      [...metricsCountries.entries()].map(country => [
        country,
        {
          name: country,
        },
      ]),
    ),
    dailyTotalsByCounty: dailyTotalsByCountry,
    projectionsByCounty: projectionsByCountry,
    growthRatesByCounty,
  };
};

const getStats = async region => {
  if (!usStats) {
    const usTotals = await fetchUSTotals('', []);
    if (usTotals) {
      usStats = usTotals.totals;
    }
  }

  if (!usStatsMap) {
    usStatsMap = new Map();
    Object.entries(usStats).forEach(entry => {
      const totals = entry[1];

      usStatsMap.set(parse(entry[0], 'yyyy-MM-dd', startOfDay(new Date())), {
        cumulative: totals.confirm,
        dead: totals.dead,
        recover: totals.recover,
      });
    });
  }

  const countries = getVisibleCountries(region);

  const showUSOnlyVersion =
    (region.zoom > 6 && countries.includes('US')) ||
    (countries.includes('US') && countries.length === 1);

  if (!showUSOnlyVersion) {
    return {
      ...getGlobalStats(countries, region),
      us: true,
      usStats,
    };
  }

  const {logs: pins, us, counties} = await fetchGraphStats(
    'graph_stats',
    region,
  );

  const countyTotals = {};

  const _pins = orderBy(pins, 'order', 'asc');

  const dailyTotalsByCounty: {[key: string]: TotalsMap} = {};
  const projectionsByCounty: {[key: string]: TotalsMap} = {};

  const totals = getTotals(_pins);
  const countsByDay = getTotalsByDay(_pins);

  const projections = getPredictions(usStatsMap, 7);
  const mapProjections = getPredictions(countsByDay, 7);

  const pinsByCounty = groupBy(_pins, 'county.id');
  const growthRatesByCounty = {};

  for (const [countyId, pins] of Object.entries(pinsByCounty)) {
    const dayTotals = getTotalsByDay(pins, 18);
    dailyTotalsByCounty[countyId] = dayTotals;
    projectionsByCounty[countyId] = getPredictions(dayTotals, 7);
    growthRatesByCounty[countyId] = getGrowthRates(dayTotals, 7);
  }

  return {
    countsByDay,
    dailyTotalsByCounty,
    mapProjections,
    totals,
    countyTotals,
    projectionsByCounty,
    projections,
    mode: 'us',
    counties,
    growthRatesByCounty,
    countries,
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
