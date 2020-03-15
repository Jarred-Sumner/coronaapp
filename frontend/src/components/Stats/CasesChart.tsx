import Numeral from 'numeral';
import * as React from 'react';
import {View} from 'react-native';
import {
  VictoryChart,
  VictoryGroup,
  VictoryLegend,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryAxis,
  VictoryLabel,
} from 'victory';
import {COLORS} from '../../lib/theme';
import {CHART_THEME, tickFormat} from './CHART_THEME';
import {styles} from './styles';
import chroma from 'chroma-js';
import {max} from 'lodash';
import {startOfDay, parse, addDays} from 'date-fns/esm';

const colors = [
  'rgb(250,250,200)',
  chroma(COLORS.confirmed)
    .alpha(1)
    .css(),
];

export const CasesChart = React.memo(
  ({
    data: dailyTotalsEntries,
    width,
    counties,
    height = 400,
    cumulative,
    usTotals,
  }) => {
    const labelComponent = React.useMemo(
      () => <VictoryTooltip renderInPortal={false} />,
      [],
    );

    const scale = React.useMemo(() => ({x: 'time', y: 'linear'}), []);
    const cumulativeCases = React.useCallback(data => {
      return data[1].cumulative;
    }, []);
    const timestamp = React.useCallback(data => data[0], []);
    const usMaxY = React.useMemo(() => {
      if (!usTotals) {
        return 0;
      }
      return max(Object.values(usTotals)?.map(value => value.confirm));
    }, [usTotals]);

    const cumulativeCaseData = React.useMemo(() => {
      let lastValue = 0;
      let lastValueDiff = 1;
      return dailyTotalsEntries.map(([x, data], index) => {
        const isLast = index === dailyTotalsEntries.length - 1;

        // Last one is messed up!

        const y =
          isLast && data.cumulative < lastValue
            ? Math.floor(Math.min(data.cumulative * lastValueDiff, usMaxY))
            : data.cumulative;

        lastValueDiff = y / lastValue;
        lastValue = y;

        return {
          x,
          y,
        };
      });
    }, [dailyTotalsEntries, usMaxY]);

    const maxDate = React.useMemo(() => addDays(startOfDay(new Date()), 1), []);

    const domain = React.useMemo(() => {
      return {
        y: [0, usMaxY],
        x: [dailyTotalsEntries[0][0], maxDate],
      };
    }, [
      usTotals,
      cumulative,
      dailyTotalsEntries,
      usMaxY,
      cumulativeCaseData,
      maxDate,
    ]);

    const legendData = React.useMemo<VictoryLegendPro>(
      () => [{name: 'United States'}, {name: 'Visible counties'}],
      [],
    );

    const containerStyles = React.useMemo(
      () => [styles.dailyChart, {width: width, height}],
      [width, height, styles],
    );

    const usCases = React.useMemo(() => {
      return usTotals
        ? Object.entries(usTotals).map(([x, {confirm: y}]) => ({
            x: parse(x, 'yyyy-MM-dd', startOfDay(new Date())),
            y,
          }))
        : [];
    }, [usTotals]);

    const cumulativeCaseDataLabels = React.useCallback(({datum}) => {
      return datum._y;
    }, []);

    const usCasesStyle = React.useMemo(() => {
      return {
        data: {
          stroke: colors[0],
        },
      };
    }, []);
    const localCasesStyle = React.useMemo(() => {
      return {
        data: {
          stroke: colors[1],
        },
      };
    }, []);

    return (
      <View style={containerStyles}>
        <VictoryChart
          width={width - 24}
          scale={scale}
          responsive={false}
          containerComponent={
            <VictoryVoronoiContainer
              labels={cumulativeCaseDataLabels}
              mouseFollowTooltips
              activateLabels={false}
              dimension="x"
              responsive={false}
              labelComponent={labelComponent}
            />
          }
          // style={{
          //   data: {stroke: '#c43a31'},
          //   parent: {border: '1px solid #ccc'},
          // }}
          theme={CHART_THEME}
          animate={false}
          responsive={false}
          height={height}>
          <VictoryLine
            // domain={{
            //   x: [0, cumulative],
            //   // y: [
            //   //   dailyTotals[0].timestamp.getTime(),
            //   //   dailyTotals[dailyTotals.length - 1].timestamp.getTime(),
            //   // ],
            // }}
            name="United States"
            style={usCasesStyle}
            data={usCases}
            width={width - 24}
            height={height}
            horizontal={false}
            responsive={false}
            standalone={false}
            domain={domain}
          />

          <VictoryLine
            data={cumulativeCaseData}
            name="Visible counties"
            style={localCasesStyle}
            width={width - 24}
            height={height}
            horizontal={false}
            responsive={false}
            standalone={false}
            domain={domain}
          />

          {/* <VictoryLine data={dailyData[1]} />
              <VictoryLine data={dailyData[2]} />
               */}

          <VictoryAxis
            dependentAxis
            tickLabelComponent={<VictoryLabel angle={-24} x={60} />}
          />

          <VictoryAxis tickFormat={tickFormat} />

          <VictoryLegend
            y={8}
            x={8}
            title="Confirmed Coronavirus cases"
            titleOrientation="top"
            orientation="horizontal"
            gutter={24}
            width={width - 24}
            standalone={false}
            colorScale={colors}
            data={legendData}
          />
        </VictoryChart>
      </View>
    );
  },
);
