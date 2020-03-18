import {get, isFinite, sum} from 'lodash';
import Numeral from 'numeral';
import * as React from 'react';
import {ScrollView, Text, View} from 'react-native';
import statsWorker from '../lib/StatsClient';
import {Totals, TotalsMap} from '../lib/Totals';
import {RegionContext} from '../routes/RegionContext';
import {PullyScrollViewContext} from './PullyView';
import {CasesChart} from './Stats/CasesChart';
import {ForecastChart} from './Stats/ForecastChart';
import {GrowthRatesChart} from './Stats/GrowthRatesChart';
import {styles} from './Stats/styles';
import {COLORS} from '../lib/theme';
import {isEmpty, orderBy, last, isArray, truncate} from 'lodash';

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
    number = value.toFixed(0) + ' days';
    if (value >= 1.0) {
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
  growthRatesByCounty,
  mode,
  usStats,
  projectionsByCounty,
  dailyTotals,
  scrollEnabled,
  projections,
  mapProjections,
  countries,
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
    if (!dailyTotals || dailyTotals.size === 0) {
      return null;
    }

    const days = [...dailyTotals.keys()];
    const today = days[days.length - 1];
    const twoDayAgo = days[days.length - 2];
    const threeDayAgo = days[days.length - 3];
    const fourDayAgo = days[days.length - 4];
    const todayTotal = dailyTotals.get(today);
    const twoDayTotal = dailyTotals.get(twoDayAgo);
    const threeDayTotal = dailyTotals.get(threeDayAgo);
    const fourDayTotal = dailyTotals.get(fourDayAgo);

    if (!today || !todayTotal) {
      return null;
    }

    const growthRates = [];
    if (fourDayTotal) {
      growthRates.push(threeDayTotal.cumulative / fourDayTotal.cumulative);
    }

    if (threeDayTotal) {
      growthRates.push(twoDayTotal.cumulative / threeDayTotal.cumulative);
    }

    if (twoDayTotal) {
      growthRates.push(todayTotal.cumulative / twoDayTotal.cumulative);
    }

    if (growthRates.length === 0) {
      return null;
    }

    const combinedRate: number =
      growthRates.reduce((total, current) => {
        return total + current;
      }, 1.0) / growthRates.length;

    if (combinedRate > 3.0) {
      return 2;
    } else if (combinedRate > 2.0) {
      return 3;
    } else if (combinedRate > 1.5) {
      return 4;
    } else {
      return null;
    }
  }, [dailyTotals]);

  const coverage = React.useMemo(() => {
    if (!totals) {
      return null;
    }

    if (mode === 'global' && totals?.countries && dailyTotalsByCounty) {
      let countyList = Array.from(totals.countries);
      if (isArray(countyList[0])) {
        countyList = countyList.map(([index, county]) => county);
      }

      countyList = orderBy(
        countyList,
        country => {
          const totals = dailyTotalsByCounty[country];

          if (!totals) {
            return 0;
          }

          const date = last([...totals.keys()]);

          if (date) {
            return dailyTotalsByCounty[country].get(date).cumulative;
          }
        },
        ['desc'],
      );

      if (countyList.length === 1) {
        return `Includes: ${countyList[0]}`;
      } else if (countyList.length === 2) {
        return `Includes: ${countyList[0]} & ${countyList[1]}`;
      } else if (countyList.length > 2) {
        return truncate(`Includes: ${countyList.join(', ')}`, {length: 300});
      } else {
        return null;
      }
    } else if (mode === 'us') {
      let countyList = [...totals.counties.values()].map(
        countyName => counties[countyName],
      );

      countyList = orderBy(
        countyList,
        ({id: country}) => {
          const totals = dailyTotalsByCounty[country];

          if (!totals) {
            return 0;
          }

          const date = last([...totals.keys()]);

          if (date) {
            return dailyTotalsByCounty[country].get(date).cumulative;
          }
        },
        ['desc'],
      );

      console.log({counties, countyList});
      if (countyList.length === 1) {
        return `${countyList[0].name} County`;
      } else if (countyList.length === 2) {
        return `${countyList[0].name} County & ${countyList[1].name} County`;
      } else if (countyList.length > 2) {
        return truncate(
          `Counties: ${countyList.map(county => county.name).join(', ')}`,
          {length: 300},
        );
      } else {
        return null;
      }
    }
  }, [counties, totals, mode, dailyTotalsByCounty]);

  // const dailyDataLabels = React.useMemo(() => {
  //   if (dailyData) {

  //   }
  // }, [dailyData])

  return (
    <View style={{flex: 1, height: 'auto'}}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.content}
        style={[styles.container, {width}]}>
        <View style={styles.countRow}>
          <CountBoxComponent
            tooltip={`Sum of cases within the ${
              mode === 'us' ? 'counties' : 'countriesd'
            } visible in the map region`}
            value={cumulative}
            label="Confirmed cases"
          />
          <View style={styles.countBoxSpacer} />
          <CountBoxComponent
            value={weeklyGrowth}
            type="percent"
            tooltip={`(todayConfirmedTotal * 2) / avg(3-day growth rate) * todayConfirmedTotal`}
            label="Doubling rate"
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

        {dailyTotals.size > 0 && (
          <CasesChart
            data={dailyTotals}
            width={width}
            totalsByRegion={dailyTotalsByCounty}
            regions={mode === 'global' ? countries : counties}
            mode={mode}
            cumulative={cumulative}
          />
        )}

        {mapProjections.size > 0 && projections.size > 0 && (
          <ForecastChart
            mapProjections={mapProjections}
            projectionsByCounty={projectionsByCounty}
            height={460}
            projections={projections}
            width={width}
            mode={mode}
            counties={counties}
          />
        )}

        {!isEmpty(growthRatesByCounty) && (
          <GrowthRatesChart
            totalsByRegion={growthRatesByCounty}
            regions={counties}
            height={484}
            width={width}
            mode={mode}
            counties={counties}
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
      projectionsByCounty,
      countries,
      growthRatesByCounty,
      mapProjections,
      us,
      mode,
      usStats,
    },
    setStats,
  ] = React.useState({
    countsByDay: new Map(),
    dailyTotalsByCounty: {},
    projectionsByCounty: {},
    growthRatesByCounty: {},
    mode: 'global',
    countries: [],
    projections: new Map(),
    mapProjections: new Map(),
    totals: null,
    usStats: null,
    countyTotals: null,
    counties: {},
  });

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
      countries={countries}
      growthRatesByCounty={growthRatesByCounty}
      // dailyData={dailyData.current}
      scrollEnabled={scrollEnabled}
      projectionsByCounty={projectionsByCounty}
      unitedStates={mode === 'us'}
      mode={mode}
      countyTotals={countyTotals}
      usStats={usStats}
      totals={totals}></StatsListComponent>
  );
};
