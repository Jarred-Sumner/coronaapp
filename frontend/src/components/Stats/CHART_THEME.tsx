import {COLORS} from '../../lib/theme';

const assign = Object.assign;
export const colors = [
  '#D564BC',
  '#D56464',
  '#C4B411',
  '#CC8E5B',
  '#7A7A7A',
  '#B6A2DE',
  '#6CC788',
  '#0CC2AA',
  '#5F7CE7',
  '#0091FF',
  '#E22070',
];
const charcoal = 'rgb(43, 54, 73)';
const grey = 'rgb(203, 203, 203)';

// Typography
const sansSerif = `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif`;
const letterSpacing = 'normal';
const fontSize = 14;

// Layout
const baseProps = {
  width: 450,
  height: 300,
  padding: 50,
  colorScale: colors,
};

// Labels
const baseLabelStyles = {
  fontFamily: sansSerif,
  fontSize,
  letterSpacing,
  padding: 10,
  fill: grey,
  stroke: 'transparent',
};
const centeredLabelStyles = assign({textAnchor: 'middle'}, baseLabelStyles);

// Strokes
const strokeLinecap = 'round';
const strokeLinejoin = 'round';

// Put it all together...
export const CHART_THEME = {
  area: assign(
    {
      style: {
        data: {
          fill: charcoal,
        },
        labels: centeredLabelStyles,
      },
    },
    baseProps,
  ),
  axis: assign(
    {
      style: {
        axis: {
          fill: COLORS.muted,
          stroke: COLORS.muted,
          strokeWidth: 1,
          strokeLinecap,
          strokeLinejoin,
        },
        axisLabel: assign({}, centeredLabelStyles, {
          padding: 25,
        }),
        grid: {
          fill: 'rgb(51, 60, 77)',
          stroke: 'rgb(51, 60, 77)',
          pointerEvents: 'none',
        },
        ticks: {
          stroke: COLORS.muted,
          size: 1,
          fill: 'rgb(51, 60, 77)',
        },
        tickLabels: baseLabelStyles,
      },
    },
    baseProps,
  ),
  bar: assign(
    {
      style: {
        data: {
          fill: charcoal,
          padding: 8,
          strokeWidth: 0,
        },
        labels: baseLabelStyles,
      },
    },
    baseProps,
  ),
  boxplot: assign(
    {
      style: {
        max: {
          padding: 8,
          stroke: charcoal,
          strokeWidth: 1,
        },
        maxLabels: baseLabelStyles,
        median: {
          padding: 8,
          stroke: charcoal,
          strokeWidth: 1,
        },
        medianLabels: baseLabelStyles,
        min: {
          padding: 8,
          stroke: charcoal,
          strokeWidth: 1,
        },
        minLabels: baseLabelStyles,
        q1: {
          padding: 8,
          fill: grey,
        },
        q1Labels: baseLabelStyles,
        q3: {
          padding: 8,
          fill: grey,
        },
        q3Labels: baseLabelStyles,
      },
      boxWidth: 20,
    },
    baseProps,
  ),
  candlestick: assign(
    {
      style: {
        data: {
          stroke: charcoal,
          strokeWidth: 1,
        },
        labels: centeredLabelStyles,
      },
      candleColors: {
        positive: '#ffffff',
        negative: charcoal,
      },
    },
    baseProps,
  ),
  chart: baseProps,
  errorbar: assign(
    {
      borderWidth: 8,
      style: {
        data: {
          fill: 'transparent',
          stroke: charcoal,
          strokeWidth: 2,
        },
        labels: centeredLabelStyles,
      },
    },
    baseProps,
  ),
  group: assign(
    {
      colorScale: colors,
    },
    baseProps,
  ),
  legend: {
    colorScale: colors,
    gutter: 24,
    orientation: 'horizontal',
    style: {
      data: {
        type: 'circle',
      },
      border: {background: charcoal},
      labels: assign({}, baseLabelStyles, {background: charcoal, zIndex: 10}),
      title: assign({}, baseLabelStyles, {padding: 5, fontSize: 20}),
    },
  },
  line: assign(
    {
      style: {
        data: {
          fill: 'transparent',
          stroke: grey,
          strokeWidth: 2,
        },
        labels: centeredLabelStyles,
      },
    },
    baseProps,
  ),
  pie: {
    style: {
      data: {
        padding: 10,
        stroke: 'transparent',
        strokeWidth: 1,
      },
      labels: assign({}, baseLabelStyles, {padding: 20}),
    },
    colorScale: colors,
    width: 400,
    height: 400,
    padding: 50,
  },
  scatter: assign(
    {
      style: {
        data: {
          fill: charcoal,
          stroke: 'transparent',
          strokeWidth: 0,
        },
        labels: centeredLabelStyles,
      },
    },
    baseProps,
  ),
  stack: assign(
    {
      colorScale: colors,
    },
    baseProps,
  ),
  tooltip: {
    style: assign({}, centeredLabelStyles, {
      padding: 5,
      pointerEvents: 'none',
    }),
    label: {
      color: COLORS.muted,
    },
    flyoutStyle: {
      stroke: COLORS.dark,
      strokeWidth: 1,
      fill: COLORS.darkMedium,
      pointerEvents: 'none',
    },
    cornerRadius: 5,
    pointerLength: 10,
  },
  voronoi: assign(
    {
      style: {
        data: {
          stroke: 'transparent',
          strokeWidth: 0,
        },
        labels: assign({}, centeredLabelStyles, {
          padding: 5,
          pointerEvents: 'none',
        }),
        flyout: {
          stroke: COLORS.dark,
          strokeWidth: 1,
          fill: COLORS.darkMedium,
          pointerEvents: 'none',
        },
      },
    },
    baseProps,
  ),
};
