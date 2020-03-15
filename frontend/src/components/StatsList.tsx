import {isSameDay, subDays} from 'date-fns/esm';
import {get, isFinite} from 'lodash';
import Numeral from 'numeral';
import * as React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {RegionContext} from '../routes/RegionContext';
import {PullyScrollViewContext} from './PullyView';
import {CasesChart} from './Stats/CasesChart';
import {ConfirmedCasesByCountyChart} from './Stats/ConfirmedCasesByCountyChart';
import {styles} from './Stats/styles';
import statsWorker from '../lib/StatsClient';
import {TotalsMap, Totals} from '../lib/stats';
import {ForecastChart} from './Stats/ForecastChart';

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

const StatsListComponent = ({
  totals,
  width,
  unitedStates = false,
  dailyTotalsByCounty,
  usStats,
  dailyTotals,
  scrollEnabled,
  projections,
  mapProjections,
  counties,
}: {
  totals: Totals;
  counties;
  usStats: TotalsMap;
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
            usTotals={usStats}
            cumulative={cumulative}
            counties={counties}
          />
        )}

        {mapProjections.size > 0 && projections.size > 0 && (
          <ForecastChart
            mapProjections={mapProjections}
            projections={projections}
            width={width}
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

  const [
    {
      countsByDay,
      dailyTotalsByCounty,
      totals,
      countyTotals,
      counties,
      projections,
      mapProjections,
      us,
      usStats,
    },
    setStats,
  ] = React.useState({
    countsByDay: new Map(),
    dailyTotalsByCounty: {},
    projections: new Map(),
    mapProjections: new Map(),
    totals: null,
    usStats: null,
    countyTotals: null,
    counties: {},
  });

  console.log({projections});
  const workerListener = React.useRef(({data: {type, stats}}) => {
    if (type === 'stats') {
      setStats(stats);
    }
  });

  React.useEffect(() => {
    if (!statsWorker) {
      return;
    }

    statsWorker.addEventListener('message', workerListener.current);

    () => {
      statsWorker.removeEventListener('message', workerListener.current);
    };
  }, [statsWorker]);

  React.useEffect(() => {
    if (!region || !statsWorker) {
      return;
    }

    statsWorker.postMessage({type: 'getStats', region});
  }, [region, statsWorker]);

  const scrollEnabled = position === 'top' || horizontal;
  return (
    <StatsListComponent
      counties={counties}
      dailyTotals={countsByDay}
      projections={projections}
      mapProjections={mapProjections}
      dailyTotalsByCounty={dailyTotalsByCounty}
      width={width}
      // dailyData={dailyData.current}
      scrollEnabled={scrollEnabled}
      unitedStates={us == true}
      countyTotals={countyTotals}
      usStats={usStats}
      totals={totals}></StatsListComponent>
  );
};
