import chroma from 'chroma-js';
import {format, subDays} from 'date-fns';
import {addDays, isSameDay, startOfDay} from 'date-fns/esm';
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
import {VictoryTooltip} from 'victory';
import {COLORS} from '../../lib/theme';
import {TotalsMap, getDateTotals} from '../../lib/Totals';
import {colors as ALL_COLORS} from './CHART_THEME';
import {styles} from './styles';

const colors = [
  'rgb(250,250,200)',
  chroma(COLORS.confirmed)
    .alpha(1)
    .css(),
];

export const CasesChart = ({
  totalsByRegion,
  width,
  height = 400,
  regions,
  mode,
  cumulative,
}) => {
  const containerStyles = React.useMemo(
    () => [styles.dailyChart, {width: width, height}],
    [width, height, styles],
  );

  const countriesToProject = React.useMemo(() => {
    return orderBy(
      Object.keys(totalsByRegion),
      country => {
        const values = [...totalsByRegion[country].values()];
        const count =
          values.length > 0 ? values[values.length - 1].cumulative : 0;

        return count;
      },
      ['desc'],
    ).slice(0, 10);
  }, [totalsByRegion, mode]);

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
    return range(0, 13)
      .reverse()
      .map((data, dateOffset) => {
        const date = subDays(startOfDay(new Date()), data);
        const formattedDate = data === 0 ? '~Today' : format(date, 'MMM d');
        const row = {
          name: formattedDate,
        };

        countriesToProject.forEach(countryName => {
          const projection: TotalsMap = totalsByRegion[countryName];

          row[countryName] =
            getDateTotals(date, projection)?.cumulative ?? null;
        }, data);

        return row;
      });
  }, [totalsByRegion, countriesToProject, regions, mode]);
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

  // let sourceName = null;
  // if (mode === 'global') {
  //   sourceName = 'John Hopkins University';
  // } else {
  //   sourceName = 'Local news (hover to see list)';
  // }

  const renderLine = React.useCallback(
    (countryName, index) => (
      <Line
        type="monotone"
        stroke={colorScale[index]}
        isAnimationActive={false}
        strokeWidth={2}
        connectNulls
        dataKey={countryName}
        name={mode === 'global' ? countryName : regions[countryName].name}
        key={countryName}
      />
    ),
    [regions, mode, colorScale],
  );

  const margin = React.useMemo(
    () => ({
      top: 0,
      right: 12,
      left: 0,
      bottom: 16,
    }),
    [],
  );

  const padding = React.useMemo(() => ({left: 0, right: 0}), []);

  return (
    <View style={containerStyles}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartLabel}>Confirmed Coronavirus cases</Text>
        </View>
      </View>
      <LineChart
        width={width - 36}
        height={height - 48}
        data={chartData}
        margin={margin}>
        <CartesianGrid stroke="rgb(43, 54, 73)" />
        <XAxis
          tickFormatter={formatTimestamp}
          stroke="rgb(43, 54, 73)"
          dataKey="name"
        />
        <YAxis
          padding={padding}
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
