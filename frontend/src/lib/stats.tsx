import {bbox, bboxPolygon, intersect, lineString} from '@turf/turf';
import {format, parse, startOfDay, addDays} from 'date-fns/esm';
import {compact, groupBy, last} from 'lodash';
import COUNTRY_BOXES from '../../data/country-boxes.json';
import GLOBAL_DATA from '../../data/global.json';
import {Totals, TotalsMap} from './Totals';

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

export const mergeTotals = (first, second): Totals => {
  const cumulative = (first?.cumulative ?? 0) + (second?.cumulative ?? 0);
  const recover = (first?.recover ?? 0) + (second?.recover ?? 0);
  const dead = (first?.dead ?? 0) + (second?.dead ?? 0);
  const _new = (first?.new ?? 0) + (second?.new ?? 0);
  const counties = new Set([
    ...(first?.counties?.entries() ?? []),
    ...(second?.counties?.entries() ?? []),
  ]);
  const countries = new Set([
    ...(first?.countries?.entries() ?? []),
    ...(second?.countries?.entries() ?? []),
  ]);

  return {
    ongoing: cumulative - recover - dead,
    cumulative,
    recover: recover,
    dead: dead,
    new: _new,
    countries,
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
    countries: new Set(['United States']),
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

export const getVisibleCountries = region => {
  const polygon = bboxPolygon(
    bbox(
      lineString([
        [region.maxLatitude, region.maxLongitude],
        [region.minLatitude, region.minLongitude],
        [region.minLatitude, region.maxLongitude],
        [region.maxLatitude, region.minLongitude],
      ]),
    ),
  );

  const validCountries = Object.keys(GLOBAL_DATA);

  return compact(
    Object.keys(COUNTRY_BOXES)
      .filter(countryName => {
        const country = COUNTRY_BOXES[countryName];
        if (!country) {
          return false;
        }
        const [
          [minLatitude, minLongitude],
          [maxLatitude, maxLongitude],
        ] = country;
        const countryPolygon = bboxPolygon(
          bbox(
            lineString([
              [minLatitude, minLongitude],
              [minLatitude, maxLongitude],
              [maxLatitude, maxLongitude],
              [maxLatitude, minLongitude],
            ]),
          ),
        );

        const inter = intersect(polygon, countryPolygon);
        return inter;
      })
      .map(countryName => {
        if (countryName === 'US') {
          return 'US';
        }

        return validCountries.find(country => {
          return (
            countryName.toLowerCase().includes(country.toLowerCase()) ||
            country.toLowerCase().includes(countryName.toLowerCase())
          );
        });
      }),
  );
};

export const getCountryTotals = countries => {
  let lastTotals = null;
  for (let i = 1; i < countries.length - 1; i++) {
    const country = countries[i];
    if (country === 'US') {
      continue;
    }
    const lastInfectionDate = last(
      Object.keys(GLOBAL_DATA[countries[i]].infections),
    );

    const totals = GLOBAL_DATA[countries[i]].infections[lastInfectionDate];
    lastTotals = lastTotals
      ? mergeTotals(lastTotals, {
          ...totals,
          countries: new Set([country]),
        })
      : totals;
  }

  return lastTotals;
};

export const getTotalForCountry = country => {
  const infections = GLOBAL_DATA[country].infections;
  const infectionsMap = new Map();
  Object.entries(infections).forEach(([dateString, totals]) => {
    const _date = parse(dateString, 'M/dd/yy', startOfDay(new Date()));
    infectionsMap.set(_date, totals);
  });

  return infectionsMap;
};

export const getCountryTotalsByDay = (countries, usStatsMap) => {
  const countsByDay: TotalsMap = new Map();

  let grouped = {};
  for (let i = 1; i < countries.length - 1; i++) {
    if (countries[i] === 'US') {
      [...usStatsMap.keys()].forEach(dateObject => {
        const dateString = format(dateObject, 'M/dd/yy');
        if (!grouped[dateString]) {
          grouped[dateString] = [];
        }

        grouped[dateString].push(usStatsMap.get(dateObject));
      });
    } else {
      const country = GLOBAL_DATA[countries[i]];

      Object.keys(country.infections).forEach(dateString => {
        if (!grouped[dateString]) {
          grouped[dateString] = [];
        }

        grouped[dateString].push(country.infections[dateString]);
      });
    }
  }

  Object.keys(grouped).map(dateString => {
    const totals = grouped[dateString].reduce(
      (totals, _total) => {
        return mergeTotals(totals, _total);
      },
      {
        ongoing: 0,
        cumulative: 0,
        recover: 0,
        dead: 0,
        new: 0,
        countries: new Set([]),
        counties: new Set([]),
      },
    );
    const date = parse(dateString, 'M/dd/yy', startOfDay(new Date()));
    countsByDay.set(date, totals);
  });

  return countsByDay;
};
