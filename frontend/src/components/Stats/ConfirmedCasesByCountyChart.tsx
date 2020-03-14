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
  VictoryScatter,
} from 'victory';
import {COLORS} from '../../lib/theme';
import {CHART_THEME, colors} from './CHART_THEME';
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

    const renderLine = React.useCallback(
      ([countyId, dailyTotalsMap]) => {
        const data = [...dailyTotalsMap.entries()];

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

    const scale = React.useMemo(() => ({x: 'time', y: 'linear'}), []);
    const legendData = React.useMemo(() => [], []);

    return (
      <View style={containerStyles}>
        <VictoryChart
          width={width - 24}
          scale={scale}
          containerComponent={
            <VictoryVoronoiContainer
              mouseFollowTooltips
              activateLabels={false}
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
            {data.map(renderLine)}
          </VictoryGroup>
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
