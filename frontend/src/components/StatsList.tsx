import {
  format,
  getWeek,
  parse,
  startOfDay,
  subDays,
  getDay,
  isSameDay,
} from 'date-fns/esm';
import {get, groupBy, isFinite, orderBy} from 'lodash';
import Numeral from 'numeral';
import * as React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {usePaginatedQuery, useQuery} from 'react-query';
import {fetchGraphStats, fetchUSTotals, getWorldStats} from '../api';
import {RegionContext} from '../routes/RegionContext';
import {PullyScrollViewContext} from './PullyView';
import {CasesChart} from './Stats/CasesChart';
import {ConfirmedCasesByCountyChart} from './Stats/ConfirmedCasesByCountyChart';
import {styles} from './Stats/styles';

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

  const weeklyGrowth = React.useMemo(() => {
    if (!dailyTotals || !dailyTotals.size === 0) {
      return null;
    }

    const days = [...dailyTotals.keys()].sort().reverse();
    const today = days[0];
    const todayTotal = dailyTotals.get(today);

    if (!today || !todayTotal) {
      return null;
    }

    const _lastWeek = subDays(today, 7);
    const lastWeek = days.find(day => isSameDay(_lastWeek, day));
    const lastWeekTotal = dailyTotals.get(lastWeek);

    if (lastWeekTotal) {
      return todayTotal.ongoing / lastWeekTotal.ongoing;
    } else {
      return null;
    }
  }, [dailyTotals]);

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

  const dailyTotalsByCountyEntries = React.useMemo(() => {
    const data = [...Object.entries(dailyTotalsByCounty)];

    return data;
  }, [dailyTotalsByCounty]);

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
            tooltip={`(thisWeek.confirmed - thisWeek.deaths - thisWeek.recovered) / (7d.ago.confirmed - 7d.ago.deaths - 7d.ago.recovered)`}
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
          dailyTotalsByCountyEntries.length > 0 &&
          dailyTotalsByCountyEntries.length < 50 && (
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

const getTotalsByDay = (pins, maxDays = null) => {
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

    let lastTotals: Totals | null = null;
    let overflowKeys = [];
    for (let i = 0; i < dayCount; i++) {
      const day = addDays(minDay, i);
      const _day = format(day, 'yyyy-MM-dd');

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

  // const counts = [...countsByDay.entries()];

  // return new Map(
  //   [...counts].slice(maxDays ? Math.max(counts.length - maxDays - 1, 0) : 0),
  // );
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

  const dailyData = React.useRef();

  React.useEffect(() => {
    getWorldStats().then(stats => {
      dailyData.current = groupBy(stats, 'date');
    });
  }, []);

  const pins = resolvedData?.logs;
  const us = resolvedData?.us ?? false;
  const counties = resolvedData?.counties;

  const [
    totalsByDay,
    dailyTotalsByCounty,
    totals,
    countyTotals,
    pred,
  ] = React.useMemo(() => {
    if (!pins || !counties) {
      return [new Map(), {}, null, null];
    }

    const countyTotals = {};

    const _pins = orderBy(pins, 'order', 'asc');
    console.time('DATA');

    const dailyTotalsByCounty: {[key: string]: TotalsMap} = {};

    const totals = getTotals(_pins);
    const countsByDay = getTotalsByDay(_pins);

    const pinsByCounty = groupBy(_pins, 'county.id');

    for (const [countyId, pins] of Object.entries(pinsByCounty)) {
      dailyTotalsByCounty[countyId] = getTotalsByDay(pins, 14);
    }

    console.timeEnd('DATA');
    return [countsByDay, dailyTotalsByCounty, totals, countyTotals];
  }, [pins, us, counties]);

  const scrollEnabled = position === 'top' || horizontal;
  return (
    <StatsListComponent
      counties={counties}
      dailyTotals={totalsByDay}
      dailyTotalsByCounty={dailyTotalsByCounty}
      width={width}
      dailyData={dailyData.current}
      scrollEnabled={scrollEnabled}
      unitedStates={us == true}
      countyTotals={countyTotals}
      totals={totals}></StatsListComponent>
  );
};
