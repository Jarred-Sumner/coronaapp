import chroma from 'chroma-js';
import {max, orderBy} from 'lodash';
import * as React from 'react';
import {View} from 'react-native';
import {VictoryTooltip} from 'victory';
import {COLORS} from '../../lib/theme';
import {TotalsMap} from '../../lib/Totals';
import {colors as ALL_COLORS} from './CHART_THEME';
import {styles} from './styles';
import {range} from 'lodash';
import {Text} from 'react-native';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {format} from 'date-fns';
import {addDays, isSameDay, startOfDay} from 'date-fns/esm';
import Numeral from 'numeral';
import {scaleLog} from 'd3-scale';

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
  const labelComponent = React.useMemo(
    () => <VictoryTooltip renderInPortal={false} />,
    [],
  );

  const containerStyles = React.useMemo(
    () => [styles.dailyChart, {width: width, height}],
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

        const dateKey = [...projection.keys()].find(_date =>
          isSameDay(_date, date),
        );
        if (dateKey) {
          row[countryName] = projection.get(dateKey).cumulative;
        }
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

  return (
    <View style={containerStyles}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartLabel}>7ish-day Coronavirus Forecast</Text>
      </View>
      <style global jsx>{`
        .recharts-wrapper {
          color: rgb(203, 203, 203);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Ubuntu, 'Helvetica Neue', sans-serif;
          font-size: 14px;
        }

        .recharts-cartesian-axis-tick-value {
          fill: rgb(203, 203, 203) !important;
        }

        .recharts-default-tooltip {
          background-color: ${COLORS.dark} !important;
          border-color: ${COLORS.darkMedium} !important;
          padding: 6px 8px !important;
          border-radius: 4px;
          box-shadow: 1px 1px 1px #000;
        }

        .recharts-tooltip-label {
          padding-bottom: 8px !important;
          margin-left: -8px !important;
          margin-right: -8px !important;
          padding-left: 8px; !important;
          padding-right: 8px !important;
          margin-bottom: 8px !important;
          box-sizing: content-box;
          border-bottom: 1px solid ${COLORS.darkMedium} !important;
        }

        //
      `}</style>
      <LineChart
        width={width - 36}
        height={height - 48}
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
        {countriesToProject.map((countryName, index) => (
          <Line
            type="monotone"
            stroke={colorScale[index]}
            isAnimationActive={false}
            strokeWidth={2}
            dataKey={countryName}
            name={mode === 'global' ? countryName : counties[countryName].name}
            key={countryName}
          />
        ))}
      </LineChart>
    </View>
  );
};
