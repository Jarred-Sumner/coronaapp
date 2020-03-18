import {subDays} from 'date-fns/esm';
import Numeral from 'numeral';
import * as React from 'react';
import {View} from 'react-native';
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLegend,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory';
import {CHART_THEME, colors, tickFormat} from './CHART_THEME';
import {styles} from './styles';

export const ConfirmedCasesByCountyChart = React.memo(
  ({width, counties, height = 400, data}) => {
    const labelComponent = React.useMemo(
      () => <VictoryTooltip renderInPortal={false} />,
      [],
    );

    const labels = React.useCallback(
      ({datum}) => {
        const _labels = [];
        const county = counties[datum.childName];
        if (county) {
          _labels.push(`${county.name}: ${Numeral(datum._y).format('0,0')}`);
        }

        return _labels.join('\n');
      },
      [counties],
    );

    const cumulativeCases = React.useCallback(data => data[1].cumulative, []);
    const timestamp = React.useCallback(data => data[0], []);

    const renderBar = React.useCallback(
      ([countyId, dailyTotalsMap]) => {
        let data = [...dailyTotalsMap.entries()];
        data = data.slice(Math.max(data.length - 14, 0));

        return (
          <VictoryLine
            key={countyId}
            name={countyId}
            // domain={{
            //   x: [0, cumulative],
            //   // y: [
            //   //   dailyTotals[0].timestamp.getTime(),
            //   //   dailyTotals[dailyTotals.length - 1].timestamp.getTime(),
            //   // ],
            // }}
            y={cumulativeCases}
            x={timestamp}
            data={data}
          />
        );
      },
      [cumulativeCases, timestamp],
    );

    const containerStyles = React.useMemo(
      () => [
        styles.dailyChart,
        {
          width: width - 24,
        },
      ],
      [width, styles],
    );

    const minDomain = React.useMemo(() => ({x: subDays(new Date(), 14)}), []);

    const scale = React.useMemo(() => ({x: 'time', y: 'linear'}), []);
    const legendData = React.useMemo(() => [], []);

    return (
      <View style={containerStyles}>
        <VictoryChart
          width={width - 24}
          scale={scale}
          minDomain={minDomain}
          // horizontal
          containerComponent={
            <VictoryVoronoiContainer
              mouseFollowTooltips
              activateLabels={false}
              dimension="x"
              responsive={false}
              labels={labels}
              labelComponent={labelComponent}
            />
          }
          // style={{
          //   data: {stroke: '#c43a31'},
          //   parent: {border: '1px solid #ccc'},
          // }}
          theme={CHART_THEME}
          animate={false}
          height={height}>
          <VictoryGroup width={width - 24} height={400} colorScale={colors}>
            {data.map(renderBar)}
          </VictoryGroup>

          <VictoryAxis dependentAxis />
          <VictoryAxis tickFormat={tickFormat} />
          <VictoryLegend
            x={-16}
            y={12}
            title="Confirmed cases by county"
            titleOrientation="top"
            centerTitle
            data={legendData}
            gutter={0}
            width={width - 24}
          />
        </VictoryChart>
      </View>
    );
  },
);
