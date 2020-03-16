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
import {CHART_THEME, tickFormat, colors as ALL_COLORS} from './CHART_THEME';
import {styles} from './styles';
import chroma from 'chroma-js';
import {max, last, fromPairs, sortBy, orderBy} from 'lodash';
import {
  startOfDay,
  parse,
  addDays,
  subDays,
  compareDesc,
  differenceInDays,
} from 'date-fns/esm';
import {TotalsMap} from '../../lib/Totals';
import {isAfter, isBefore} from 'date-fns';

const colors = [
  'rgb(250,250,200)',
  chroma(COLORS.confirmed)
    .alpha(1)
    .css(),
];

export const CasesChart = props => {
  if (props.mode === 'us') {
    return <USCasesChart {...props} />;
  } else if (props.mode === 'global') {
    return <GlobalCasesChart {...props} />;
  } else {
    return null;
  }
};

const USCasesChart = React.memo(
  ({
    data: dailyTotalsEntries,
    width,
    dailyTotalsByCountyEntries,
    counties,
    mode,
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

    const maxDate = React.useMemo(() => startOfDay(new Date()), []);

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

const CountryLine = ({
  countyId,
  dailyTotals,
  width,
  domain,
  color,
  scale,
  height,
}: {
  countyId: string;
  dailyTotals: TotalsMap;
}) => {
  const data = React.useMemo(() => {
    const days = [...dailyTotals.keys()];

    return days.map(x => {
      return {x, y: dailyTotals.get(x).cumulative};
    });
  }, [dailyTotals]);

  const style = React.useMemo(() => {
    return {
      data: {
        fill: 'transparent',
        stroke: color,
        strokeWidth: 2,
      },
    };
  }, [color]);

  return (
    <VictoryLine
      horizontal={false}
      responsive={false}
      standalone={false}
      key={countyId}
      name={countyId}
      data={data}
      style={style}
      scale={scale}
      domain={domain}
      width={width}
      height={height}
    />
  );
};

const scale = {
  x: 'time',
  y: 'linear',
};

const GlobalCasesChart = ({
  data: dailyTotalsEntries,
  countryTotals: _countryData,
  width,
  dailyTotalsByCountyEntries,
  counties,
  mode,
  countries,
  height = 400,
  cumulative,
  usTotals,
}) => {
  const countryData: {[key: string]: TotalsMap} = React.useMemo(() => {
    return fromPairs(_countryData);
  }, [_countryData, scale]);

  const labelComponent = <VictoryTooltip renderInPortal={false} />;

  const maxDate = React.useMemo(() => startOfDay(new Date()), []);

  const containerStyles = React.useMemo(
    () => [styles.dailyChart, {width: width, height}],
    [width, height, styles],
  );

  const cumulativeCaseDataLabels = React.useCallback(({datum}) => {
    console.log(datum);
    return datum._y;
  }, []);

  const countriesToShow = React.useMemo(() => {
    const countryList = Object.keys(countryData);
    if (countryList.length > 10) {
      return orderBy(
        countryList,
        key => {
          const country = countryData[key];

          if (!country || country.size < 1) {
            return -1;
          }

          const lastDate = last([...country.keys()]);

          const lastTotals = country.get(lastDate);

          return lastTotals.cumulative;
        },
        ['desc'],
      ).slice(0, 20);
    } else {
      return countryList;
    }
  }, [countryData]);

  const legendData = React.useMemo<VictoryLegendPro>(
    () =>
      countriesToShow.map(countryName => ({
        name: countryName,
      })),
    [countriesToShow],
  );

  const domain = React.useMemo(() => {
    let maxY = cumulative;
    let _maxDate = maxDate;
    let minY = 0;
    const minDate = startOfDay(subDays(new Date(), 7));
    const countryNames = Object.keys(countryData);
    if (countryNames.length > 10) {
      const country: TotalsMap = countryData[countriesToShow[0]];

      if (country) {
        const date = last([...country.keys()]);
        const entry = country.get(date);

        if (entry) {
          maxY = entry.cumulative;
          _maxDate = date;
        }
      }
    }

    return {
      y: [minY, maxY * 1.1],
      x: [minDate, _maxDate],
    };
  }, [
    usTotals,
    cumulative,
    dailyTotalsEntries,
    countries,
    countriesToShow,
    maxDate,
    countryData,
  ]);

  const countryColors = React.useMemo(() => {
    return countriesToShow.map((_, index) => {
      let colorIndex = index;

      if (colorIndex > ALL_COLORS.length - 1) {
        colorIndex = index % ALL_COLORS.length;
      }

      return ALL_COLORS[colorIndex];
    });
  }, [countriesToShow]);

  const renderCountryChart = React.useCallback(
    (countryId, index) => {
      const dailyTotals = countryData[countryId];

      return (
        <CountryLine
          countyId={countryId}
          dailyTotals={dailyTotals}
          key={countryId}
          domain={domain}
          scale={scale}
          width={width - 24}
          color={countryColors[index]}
          height={height}
        />
      );
    },
    [countryData, width, height, domain, scale, countryColors],
  );

  return (
    <View style={containerStyles}>
      <VictoryChart
        width={width - 24}
        scale={scale}
        responsive={false}
        containerComponent={
          <VictoryVoronoiContainer
            activateLabels={false}
            dimension="x"
            responsive={false}
            labels={cumulativeCaseDataLabels}
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
          width={width - 24}
          height={height}
          responsive={false}
          domain={domain}
          scale={scale}
          standalone={false}>
          {countriesToShow.map(renderCountryChart)}

          <VictoryAxis
            dependentAxis
            scale={scale}
            standalone={false}
            tickLabelComponent={<VictoryLabel angle={-24} x={60} />}
          />

          <VictoryAxis
            scale={scale}
            standalone={false}
            tickCount={7}
            tickFormat={tickFormat}
          />
        </VictoryGroup>

        <VictoryLegend
          y={8}
          x={8}
          title="Confirmed Coronavirus cases"
          titleOrientation="top"
          orientation="horizontal"
          gutter={24}
          width={width - 24}
          standalone={false}
          colorScale={countryColors}
          data={legendData}
        />
      </VictoryChart>
    </View>
  );
};
