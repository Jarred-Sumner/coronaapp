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
import {CHART_THEME, tickFormat, colors as ALL_COLORS} from './CHART_THEME';
import {styles} from './styles';
import chroma from 'chroma-js';
import {max, last, first, min, minBy, maxBy, orderBy} from 'lodash';
import {format, isSameDay} from 'date-fns';
import {startOfDay, parse, addDays, subDays} from 'date-fns/esm';

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
    return `${datum.childName}: ${datum._y}`;
  }, []);

  const countriesToProject = React.useMemo(
    () =>
      mode === 'global'
        ? orderBy(
            Object.keys(projectionsByCounty),
            country => {
              const values = [...projectionsByCounty[country].values()];
              return values.length > 0
                ? values[values.length - 1].cumulative
                : 0;
            },
            ['desc'],
          ).slice(0, 8)
        : [],
    [projectionsByCounty, mode],
  );
  const legendData = React.useMemo<VictoryLegendPro>(
    () =>
      mode === 'us'
        ? [{name: 'United States'}, {name: 'Visible counties'}]
        : countriesToProject?.map(name => ({name})),
    [mode, countriesToProject],
  );

  const domain = React.useMemo(() => {
    if (mode === 'global') {
      // const minY =or(
      //   max(
      //     countriesToProject.map(country => {
      //       const values = [...projectionsByCounty[country].keys()];
      //       return values[0]
      //     }),
      //   ),
      //   0,
      // );

      const maxX = Math.max(
        max(
          countriesToProject.map(country => {
            const values = [...projectionsByCounty[country].values()];
            return values.length > 0 ? values[values.length - 1].cumulative : 0;
          }),
        ),
        0,
      );

      const minX = Math.max(
        min(
          countriesToProject.map(country => {
            const values = [...projectionsByCounty[country].values()];
            return values.length > 0 ? values[0].cumulative : 0;
          }),
        ),
        0,
      );

      // const countryDates = countriesToProject.map(country => {
      //   const dates = [...projectionsByCounty[country].keys()];
      //   return dates.map(date => {

      //   });
      // });

      return {
        y: [minX, maxX * 1.1],
        x: [addDays(new Date(), 1), addDays(new Date(), 7)],
      };
    } else {
      const _projections = [...projections.entries()];
      const firstProjection = _projections[0];
      const lastProjection = _projections[projections.size - 1];
      const countryProjection =
        countriesToProject &&
        countriesToProject.length > 0 &&
        projectionsByCounty[countriesToProject[0]];
      const timestamp = countryProjection
        ? subDays(max([...countryProjection.keys()]), 1)
        : null;

      return {
        y: [0, lastProjection[1].cumulative],
        x: [addDays(new Date(), 1), addDays(new Date(), 7)],
      };
    }
  }, [
    usTotals,
    cumulative,
    projections,
    usMaxY,
    cumulativeCaseData,
    countriesToProject,
  ]);

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

  const renderProjection = React.useCallback(
    (projection, index) => {
      const data = [...projectionsByCounty[projection].entries()].map(
        ([x, {cumulative: y}]) => ({
          x,
          y,
        }),
      );

      const color = colorScale[index];

      const style = {
        data: {
          fill: 'transparent',
          stroke: color,
          strokeWidth: 2,
        },
      };

      return (
        <VictoryLine
          data={data}
          name={projection}
          key={`${projection}-${domain.x.join('-')}-${domain.y.join('-')}`}
          width={width - 24}
          height={height}
          horizontal={false}
          responsive={false}
          standalone={false}
          style={style}
          // domain={domain}
        />
      );
    },
    [projectionsByCounty, domain, scale, colorScale],
  );

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
        <VictoryGroup
          height={height}
          horizontal={false}
          // domain={domain}
          scale={scale}
          responsive={false}
          standalone={false}>
          {mode === 'us' && (
            <>
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
                labelComponent={<VictoryLabel x={40} />}
                domain={domain}
              />
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
            </>
          )}

          <VictoryAxis
            dependentAxis
            fixLabelOverlap
            tickLabelComponent={<VictoryLabel angle={-24} x={60} />}
          />

          <VictoryAxis tickFormat={tickFormat} />

          {mode === 'global' && countriesToProject.map(renderProjection)}
          {/* <VictoryLine data={dailyData[1]} />
              <VictoryLine data={dailyData[2]} />
               */}
        </VictoryGroup>
        <VictoryLegend
          y={8}
          x={8}
          title="7-day Coronavirus forecast"
          titleOrientation="top"
          orientation="horizontal"
          gutter={12}
          itemsPerRow={4}
          width={width - 24}
          standalone={false}
          colorScale={colorScale}
          data={legendData}
        />
      </VictoryChart>
    </View>
  );
};
