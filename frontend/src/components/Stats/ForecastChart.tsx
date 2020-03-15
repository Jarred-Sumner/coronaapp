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
  VictoryLabel,
  VictoryAxis,
} from 'victory';
import {COLORS} from '../../lib/theme';
import {CHART_THEME, tickFormat} from './CHART_THEME';
import {styles} from './styles';
import chroma from 'chroma-js';
import {max} from 'lodash';
import {format, isSameDay} from 'date-fns';
import {startOfDay, parse, addDays} from 'date-fns/esm';

const colors = [
  'rgb(250,250,200)',
  chroma(COLORS.confirmed)
    .alpha(1)
    .css(),
];

export const ForecastChart = React.memo(
  ({
    mapProjections,
    projections,
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

    const usMaxY = React.useMemo(() => {
      if (!projections) {
        return 0;
      }
      return max(Object.values(projections)?.map(value => value.cumulative));
    }, [projections]);

    const cumulativeCaseData = React.useMemo(() => {
      return mapProjections
        ? [...mapProjections.entries()].map(([x, {cumulative: y}]) => ({
            x,
            y,
          }))
        : [];
    }, [mapProjections]);

    const domain = React.useMemo(() => {
      const _projections = [...projections.entries()];
      const firstProjection = _projections[0];
      const lastProjection = _projections[projections.size - 1];
      console.log({_projections});
      return {
        y: [0, lastProjection[1].cumulative],
        x: [firstProjection[0], lastProjection[0]],
      };
    }, [usTotals, cumulative, projections, usMaxY, cumulativeCaseData]);

    const legendData = React.useMemo<VictoryLegendPro>(
      () => [{name: 'United States'}, {name: 'Visible counties'}],
      [],
    );

    const containerStyles = React.useMemo(
      () => [styles.dailyChart, {width: width, height}],
      [width, height, styles],
    );

    const usCases = React.useMemo(() => {
      return projections
        ? [...projections.entries()].map(([x, {cumulative: y}]) => ({
            x,
            y,
          }))
        : [];
    }, [projections]);

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

    const axisLabel = <VictoryLabel angle={45} />;

    return (
      <View pointerEvents="none" style={containerStyles}>
        <VictoryChart
          width={width - 24}
          scale={scale}
          responsive={false}
          containerComponent={
            <VictoryVoronoiContainer
              labels={cumulativeCaseDataLabels}
              mouseFollowTooltips
              responsive={false}
              dimension="x"
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
            labels={['🇺🇸']}
            labelComponent={<VictoryLabel x={40} />}
            domain={domain}
          />

          <VictoryAxis
            dependentAxis
            fixLabelOverlap
            tickLabelComponent={<VictoryLabel angle={-24} x={60} />}
          />

          <VictoryAxis tickFormat={tickFormat} />

          <VictoryLine
            data={cumulativeCaseData}
            name="Map region"
            style={localCasesStyle}
            width={width - 24}
            height={height}
            labels={['Cases in map region']}
            labelComponent={<VictoryLabel x={160} />}
            horizontal={false}
            responsive={false}
            standalone={false}
            domain={domain}
          />

          {/* <VictoryLine data={dailyData[1]} />
              <VictoryLine data={dailyData[2]} />
               */}

          <VictoryLegend
            y={8}
            x={8}
            title="7-day Coronavirus forecast"
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
