import chroma from 'chroma-js';
import {format, subDays} from 'date-fns';
import {addDays, isSameDay, startOfDay} from 'date-fns/esm';
import {orderBy, range} from 'lodash';
import Numeral from 'numeral';
import * as React from 'react';
import {Text, View} from 'react-native';
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  ReferenceLine,
  YAxis,
} from 'recharts';
import {VictoryTooltip} from 'victory';
import {COLORS} from '../../lib/theme';
import {TotalsMap} from '../../lib/Totals';
import {colors as ALL_COLORS} from './CHART_THEME';
import {styles} from './styles';

const colors = [
  'rgb(250,250,200)',
  chroma(COLORS.confirmed)
    .alpha(1)
    .css(),
];

export const GrowthRatesChart = ({
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
          values.length > 0 ? values[values.length - 1].cumulative : 0.0;

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
    let startRange = 1;
    let endRange = 15;

    if (mode === 'us') {
      startRange = 1;
      endRange = 7;
    }
    return range(startRange, endRange)
      .reverse()
      .map((data, dateOffset) => {
        const date = subDays(startOfDay(new Date()), data);
        const formattedDate = data === 0 ? '~Today' : format(date, 'MMM d');
        const row = {
          name: formattedDate,
        };

        countriesToProject.forEach(countryName => {
          const projection: TotalsMap = totalsByRegion[countryName];

          const dateKey = [...projection.keys()].find(_date =>
            isSameDay(_date, date),
          );

          if (dateKey) {
            row[countryName] = projection.get(dateKey).cumulative;
          } else {
            row[countryName] = 1.0;
          }
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

  const formatPercent = React.useCallback(number => {
    return Numeral(number - 1.0).format('0%');
  }, []);

  const tooltipFormatter = React.useCallback(
    (value, name, props) => {
      return [formatPercent(value), name];
    },
    [formatPercent],
  );

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

  return (
    <View style={containerStyles}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartLabel}>
            Growth rate of Coronavirus cases
          </Text>
        </View>
        <View>
          <Text style={styles.chartSubtitle}>
            Day over day change in confirmed Coronavirus cases. Less than 1% is
            good.
          </Text>
        </View>
      </View>
      <LineChart
        width={width - 36}
        height={height - 48}
        data={chartData}
        margin={{
          top: 0,
          right: 12,
          left: 0,
          bottom: 36,
        }}>
        <CartesianGrid stroke="rgb(43, 54, 73)" />
        <XAxis
          tickFormatter={formatTimestamp}
          stroke="rgb(43, 54, 73)"
          dataKey="name"
        />
        <YAxis
          padding={{left: 0, right: 0}}
          tickFormatter={formatPercent}
          type="number"
          allowDecimals
          scale="log"
          domain={[1.0, 'dataMax']}
          stroke="rgb(43, 54, 73)"
        />
        <Tooltip formatter={tooltipFormatter} />

        <Legend />

        {countriesToProject.map(renderLine)}
      </LineChart>
    </View>
  );
};
