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
} from 'victory';
import {COLORS} from '../../lib/theme';
import {CHART_THEME, colors} from './CHART_THEME';
import {styles} from './styles';

export const CasesChart = React.memo(
  ({data: dailyTotalsEntries, width, counties, height = 400, cumulative}) => {
    const labelComponent = React.useMemo(
      () => <VictoryTooltip renderInPortal={false} />,
      [],
    );

    const scale = React.useMemo(() => ({x: 'time', y: 'linear'}), []);
    const cumulativeCases = React.useCallback(data => {
      return data[1].cumulative;
    }, []);
    const newCases = React.useCallback(data => data[1].ongoing, []);
    const timestamp = React.useCallback(data => data[0], []);
    const domain = React.useMemo(
      () => ({
        y: [0, cumulative],
        x: [
          dailyTotalsEntries[0][0],
          dailyTotalsEntries[dailyTotalsEntries.length - 1][0],
        ],
      }),
      [cumulative, dailyTotalsEntries],
    );
    const legendData = React.useMemo(
      () => [{name: 'New cases'}, {name: 'Confirmed cases'}],
      [],
    );

    const containerStyles = React.useMemo(
      () => [styles.dailyChart, {width: width, height}],
      [width, height, styles],
    );

    const cumulativeCaseData = React.useMemo(() => {
      return dailyTotalsEntries.map(([x, data]) => ({
        x,
        y: data.cumulative,
      }));
    }, [dailyTotalsEntries]);

    const newCaseData = React.useMemo(() => {
      return dailyTotalsEntries.map(([x, {new: y}]) => ({
        x,
        y,
      }));
    }, [dailyTotalsEntries]);

    const cumulativeCaseDataLabels = React.useCallback(({datum}) => {
      return datum._y;
    }, []);

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
              activateLabels
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
          height={400}>
          <VictoryGroup
            width={width - 24}
            height={400}
            horizontal={false}
            responsive={false}
            domain={domain}
            colorScale={colors}>
            <VictoryLine
              // domain={{
              //   x: [0, cumulative],
              //   // y: [
              //   //   dailyTotals[0].timestamp.getTime(),
              //   //   dailyTotals[dailyTotals.length - 1].timestamp.getTime(),
              //   // ],
              // }}
              name="newCases"
              data={newCaseData}
            />

            <VictoryLine data={cumulativeCaseData} name="cumulativeCases" />

            {/* <VictoryLine data={dailyData[1]} />
              <VictoryLine data={dailyData[2]} />
               */}
          </VictoryGroup>

          <VictoryLegend
            y={8}
            x={8}
            title="Coronavirus in counties on map"
            titleOrientation="top"
            orientation="horizontal"
            gutter={24}
            width={width - 24}
            data={legendData}
          />
        </VictoryChart>
      </View>
    );
  },
);
