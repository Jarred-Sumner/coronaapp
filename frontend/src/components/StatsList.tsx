import * as React from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import {usePaginatedQuery} from 'react-query';
import {RegionContext} from '../routes/RegionContext';
import {apiFetcher, fetchGraphStats} from '../api';
import Numeral from 'numeral';
import chroma from 'chroma-js';
import {
  get,
  isFinite,
  fromPairs,
  min,
  range,
  max,
  groupBy,
  sort,
  orderBy,
  compact,
} from 'lodash';
import {COLORS} from '../lib/theme';
import {
  isSameWeek,
  isSameDay,
  startOfWeek,
  differnceInWeeks,
  startOfDay,
  format,
  getWeek,
  closestIndexTo,
  isAfter,
  closestTo,
  isBefore,
  parse,
} from 'date-fns/esm';
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
  VictoryBar,
  VictoryContainer,
  VictoryLegend,
  VictoryGroup,
  VictoryZoomContainer,
  VictoryTooltip,
  VictoryClipContainer,
  VictoryBrushContainer,
  VictoryCursorContainer,
  VictoryVoronoiContainer,
} from 'victory';
import {CHART_THEME, colors} from './Stats/CHART_THEME';
import {PullyScrollViewContext} from './PullyView';
import {styles} from './Stats/styles';
import {ConfirmedCasesByCountyChart} from './Stats/ConfirmedCasesByCountyChart';
import {CasesChart} from './Stats/CasesChart';

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

const startOfUTCDay = date => new Date(date.setUTCHours(0, 0, 0, 0));

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

// function addDays(dirtyDate, amount) {
//   const date = getUTCDate(dirtyDate);
//   date.setUTCHours(0, 0, 0, 0);
//   date.setUTCDate(date.getDate() + amount);

//   return date;
// }

const CountBoxComponent = React.memo(({value, label, type, tooltip}) => {
  let number = value;
  let valueStyle = styles.value;
  if (type == 'percent' && isFinite(value)) {
    number = value.toFixed(2) + 'x';
    if (value > 1.0) {
      valueStyle = styles.warningValue;
    }
  } else if (isFinite(value)) {
    number = Numeral(value).format('0,0');
  } else {
    number = '–';
  }

  return (
    <View data-tip={tooltip} style={styles.countBox}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={valueStyle}>
        {number}
      </Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>
        {label}
      </Text>
    </View>
  );
});

const mergeTotals = (first, second): Totals => {
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

const groupDataBy = (counties, interval, maxRange = 6) => {
  if (interval === 'week') {
    return fromPairs(
      Object.entries(counties).map(([id, county]) => {
        let lastWeek = null;
        const data = {};

        for (let [stamp, totals] of Object.entries(county.daily)) {
          const timestamp = getUTCDate(parse('YYYY/MM/DD'));
          const weekstamp = startOfTheWeek(timestamp);

          if (lastWeek === weekstamp) {
            data[weekstamp] = mergeTotals(data[weekstamp], totals);
          } else {
            data[weekstamp] = totals;
          }
        }

        return [id, data];
      }),
    );
  } else if (interval === 'daily') {
    const dailies = {};
    let lastDate = null;

    let lastTotals = null;
    let startDate = null;
    let endDate = null;

    Object.values(counties).map(county => {
      Object.entries(county.daily).forEach(([date, toals]) => {
        if (dailies[date]) {
          dailies[date] = mergeTotals(dailies[date], toals);
        } else {
          dailies[date] = toals;
        }
      });
    });

    return dailies;
  }
};

const StatsListComponent = ({
  totals,
  width,
  unitedStates = false,
  dailyTotalsByCounty,
  dailyTotals,
  scrollEnabled,
  counties,
}: {
  totals: Totals;
  counties;
  dailyTotals: TotalsMap;
}) => {
  const ongoing = get(totals, 'ongoing');
  const recovered = get(totals, 'recover');
  const dead = get(totals, 'dead');
  const cumulative = get(totals, 'cumulative');

  const weeklyTotals = React.useMemo<TotalsMap>(() => {
    const weeks = new Map();
    dailyTotals.forEach((totals, date) => {
      const week = getWeek(date);

      let previous = null;
      if (weeks.has(week)) {
        previous = weeks.get(week);
      }

      weeks.set(week, previous ? mergeTotals(totals, previous) : totals);
      return weeks;
    });

    return weeks;
  }, [dailyTotals]);

  const lastWeek = React.useMemo(() => {
    const weeks = [...weeklyTotals.entries()];
    if (weeks.length < 2) {
      return null;
    }

    return weeks[weeks.length - 2][1];
  }, [weeklyTotals]);

  const thisWeek = React.useMemo(() => {
    const weeks = [...weeklyTotals.entries()];
    if (weeks.length < 2) {
      return null;
    }

    return weeks[weeks.length - 1][1];
  }, [weeklyTotals]);

  const weeklyGrowth = React.useMemo(() => {
    if (!thisWeek || !lastWeek) {
      return null;
    }

    return thisWeek.ongoing / lastWeek.ongoing;
  }, [thisWeek, lastWeek]);

  const coverage = React.useMemo(() => {
    if (!unitedStates || !counties || Object.keys(counties).length === 0) {
      return null;
    }

    const countyList = Object.values(counties);

    if (countyList.length === 1) {
      return `${countyList[0].name} County`;
    } else if (countyList.length === 2) {
      return `${countyList[0].name} County & ${countyList[1].name} County`;
    } else if (countyList.length > 2) {
      return `Counties: ${countyList.map(county => county.name).join(', ')}`;
    } else {
      return null;
    }
  }, [counties, unitedStates]);

  // const dailyDataLabels = React.useMemo(() => {
  //   if (dailyData) {

  //   }
  // }, [dailyData])

  const dailyTotalsEntries = React.useMemo(
    () => [...dailyTotals.entries()].slice(Math.max(dailyTotals.size - 14, 0)),
    [dailyTotals],
  );

  const dailyTotalsByCountyEntries = React.useMemo(
    () => [...Object.entries(dailyTotalsByCounty)],
    [dailyTotalsByCounty],
  );

  return (
    <View style={{flex: 1, height: 'auto'}}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.content}
        style={[styles.container, {width}]}>
        <View style={styles.countRow}>
          <CountBoxComponent
            tooltip="Sum of cases within the counties visible in the map region"
            value={cumulative}
            label="Confirmed cases"
          />
          <View style={styles.countBoxSpacer} />
          <CountBoxComponent
            value={weeklyGrowth}
            type="percent"
            tooltip={`(thisWeek.confirmed - thisWeek.deaths - thisWeek.recovered) / (lastWeek.confirmed - lastWeek.deaths - lastWeek.recovered)`}
            label="Weekly growth rate"
          />
        </View>

        <View style={styles.countRow}>
          <CountBoxComponent value={dead} label="Deaths" />
          <View style={styles.countBoxSpacer} />
          <CountBoxComponent value={recovered} label="Recovered" />
        </View>

        <View style={styles.coverageRow}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            data-tip={coverage}
            style={styles.coverageLabel}>
            {coverage}
          </Text>
        </View>

        {dailyTotalsEntries.length > 0 && (
          <CasesChart
            data={dailyTotalsEntries}
            width={width}
            cumulative={cumulative}
            counties={counties}
          />
        )}

        {dailyTotalsEntries.length > 0 &&
          dailyTotalsByCountyEntries.length > 0 && (
            <ConfirmedCasesByCountyChart
              data={dailyTotalsByCountyEntries}
              counties={counties}
              width={width}
            />
          )}
      </ScrollView>
    </View>
  );
};

type Totals = {
  cumulative: number;
  new: number;
  ongoing: number;
  recover: number;
  dead: number;
  counties: Set<string>;
};

type TotalsMap = Map<Date, Totals>;

const getTotals = (pins, lastTotals): Totals => {
  const totals = {
    cumulative: lastTotals?.cumulative ?? 0,
    ongoing: lastTotals?.ongoing ?? 0,
    recover: 0,
    dead: 0,
    new: 0,
    counties: lastTotals ? new Set([...lastTotals.counties]) : new Set(),
  };

  for (const pin of pins) {
    totals.new = pin.infections.confirm;
    totals.cumulative += pin.infections.confirm;
    totals.recover += pin.infections.recover;
    totals.dead += pin.infections.dead;
    totals.counties.add(pin.county.id);
  }

  totals.ongoing = totals.cumulative - totals.recover - totals.dead;

  return totals;
};

const getTotalsByDay = pins => {
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
    const minDay = days[0];

    const maxDay = days[days.length - 1];
    const dayCount = daysBetween(minDay, maxDay) + 1;

    let lastTotals = null;
    for (let i = 0; i < dayCount; i++) {
      const day = addDays(minDay, i);
      const _day = format(day, 'yyyy-MM-dd');
      if (logsByDay[_day]) {
        countsByDay.set(day, logsByDay[_day]);
        lastTotals = logsByDay[_day];
      } else if (lastTotals) {
        countsByDay.set(day, lastTotals);
      }
    }
  }

  return countsByDay;
};

export const StatsList = ({
  nativeViewRef,
  scrollY,
  listRef,
  horizontal,
  height,

  headerHeight,
  width,
  insetHeight,
  translateY,
}) => {
  const {region} = React.useContext(RegionContext);
  const {position} = React.useContext(PullyScrollViewContext) ?? {};

  const {resolvedData} = usePaginatedQuery(
    ['graph_stats', region],
    fetchGraphStats,
  );

  const pins = resolvedData?.logs;
  const us = resolvedData?.us ?? false;
  const counties = resolvedData?.counties;

  const [totalsByDay, dailyTotalsByCounty, totals] = React.useMemo(() => {
    if (!pins || !counties) {
      return [new Map(), {}, null];
    }

    const _pins = orderBy(pins, 'order', 'asc');
    console.time('DATA');

    const dailyTotalsByCounty: {[key: string]: TotalsMap} = {};

    const totals = getTotals(_pins);
    const countsByDay = getTotalsByDay(_pins);

    const pinsByCounty = groupBy(_pins, 'county.id');
    for (const [countyId, pins] of Object.entries(pinsByCounty)) {
      dailyTotalsByCounty[countyId] = getTotalsByDay(pins);
    }

    console.timeEnd('DATA');
    return [countsByDay, dailyTotalsByCounty, totals];
  }, [pins, us, counties]);

  console.log('RENDER?');

  const scrollEnabled = position === 'top' || horizontal;
  return (
    <StatsListComponent
      counties={counties}
      dailyTotals={totalsByDay}
      dailyTotalsByCounty={dailyTotalsByCounty}
      width={width}
      scrollEnabled={scrollEnabled}
      unitedStates={us == true}
      totals={totals}></StatsListComponent>
  );
};
