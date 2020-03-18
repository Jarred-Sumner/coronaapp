import chroma from 'chroma-js';
import {format} from 'date-fns';
import {addDays, startOfDay} from 'date-fns/esm';
import {orderBy, range} from 'lodash';
import Numeral from 'numeral';
import * as React from 'react';
import {Text, View} from 'react-native';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {COLORS} from '../../lib/theme';
import {getDateTotals, TotalsMap} from '../../lib/Totals';
import {colors as ALL_COLORS} from './CHART_THEME';
import {styles} from './styles';

const colors = [
  'rgb(250,250,200)',
  chroma(COLORS.confirmed)
    .alpha(1)
    .css(),
];

export const ForecastChart = ({
  mapProjections,
  projections,
  projectionsByCounty,
  width,
  counties,
  height = 400,
  mode,
  cumulative,
  usTotals,
}) => {
  const containerStyles = React.useMemo(
    () => [styles.dailyChart, {width: width, height: height}],
    [width, height, styles],
  );

  const countriesToProject = React.useMemo(
    () =>
      orderBy(
        Object.keys(projectionsByCounty),
        country => {
          const values = [...projectionsByCounty[country].values()];
          return values.length > 0 ? values[values.length - 1].cumulative : 0;
        },
        ['desc'],
      ).slice(0, 10),
    [projectionsByCounty, mode],
  );

  const colorScale = React.useMemo(
    () =>
      countriesToProject.length > 0
        ? countriesToProject.map((country, index) => {
            let colorIndex = index;

            if (colorIndex > ALL_COLORS.length - 1) {
              colorIndex = index % ALL_COLORS.length;
            }

            return ALL_COLORS[colorIndex];
          })
        : colors,
    [ALL_COLORS, colors, countriesToProject],
  );

  const chartData = React.useMemo(() => {
    return range(1, 7).map((data, dateOffset) => {
      const date = addDays(startOfDay(new Date()), data);
      const formattedDate = format(date, 'MMM d');
      const row = {
        name: formattedDate,
      };

      countriesToProject.forEach(countryName => {
        const projection: TotalsMap = projectionsByCounty[countryName];

        row[countryName] = getDateTotals(date, projection)?.cumulative;
      }, data);

      return row;
    });
  }, [projectionsByCounty, countriesToProject, counties, mode]);
  const formatTimestamp = React.useCallback(
    timestamp => {
      const index = chartData.findIndex(row => row.name === timestamp);

      if (index === 0 || chartData.length - 1 === index) {
        return timestamp;
      } else {
        return '';
      }
    },
    [chartData],
  );

  const formatNumber = React.useCallback(number => {
    return Numeral(number).format('0a');
  }, []);

  const renderLine = React.useCallback(
    (countryName, index) => (
      <Line
        type="monotone"
        stroke={colorScale[index]}
        isAnimationActive={false}
        strokeWidth={2}
        connectNulls
        dataKey={countryName}
        name={mode === 'global' ? countryName : counties[countryName].name}
        key={countryName}
      />
    ),
    [counties, mode, colorScale],
  );

  return (
    <View style={containerStyles}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartLabel}>7ish-day Coronavirus Forecast</Text>
        </View>
        <View>
          <Text style={styles.chartSubtitle}>
            Based on growth rates. Quarantine and social distancing will slow
            the spread.
          </Text>
        </View>
      </View>

      <LineChart
        width={width - 36}
        height={height - 68}
        data={chartData}
        margin={{
          top: 0,
          right: 12,
          left: 0,
          bottom: 16,
        }}>
        <CartesianGrid stroke="rgb(43, 54, 73)" />
        <XAxis
          tickFormatter={formatTimestamp}
          stroke="rgb(43, 54, 73)"
          dataKey="name"
        />
        <YAxis
          padding={{left: 0, right: 0}}
          tickFormatter={formatNumber}
          type="number"
          stroke="rgb(43, 54, 73)"
        />
        <Tooltip sty />
        <Legend />
        {countriesToProject.map(renderLine)}
      </LineChart>
    </View>
  );
};
