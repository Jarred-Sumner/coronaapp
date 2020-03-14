import {StyleSheet} from 'react-native';
import chroma from 'chroma-js';
import {COLORS} from '../../lib/theme';

const white = 'rgb(201, 209, 218)';

const BOX_SHADOW = {
  shadowRadius: 10,
  borderRadius: 4,
  backgroundColor: COLORS.darkMedium,
  shaodwOffset: {
    width: 0,
    height: 4,
  },
  shadowColor: 'black',
  shadowOpacity: 0.1,
};

export const styles = StyleSheet.create({
  countBox: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingVertical: 16,
    maxHeight: 100,
    flexBasis: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    borderRadius: 4,
    ...BOX_SHADOW,
  },
  countBoxSpacer: {
    width: 12,
    flexShrink: 0,
    height: 1,
  },
  coverageRow: {
    paddingVertical: 8,
    flexShrink: 0,
    marginHorizontal: 16,
  },
  coverageLabel: {
    color: white,
    opacity: 0.75,
    fontSize: 14,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: white,
    flexShrink: 0,
  },
  warningValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    flexShrink: 0,
    textAlign: 'center',
    color: chroma(COLORS.confirmed)
      .alpha(1)
      .css(),
  },
  label: {
    color: white,
    fontSize: 16,
    flexShrink: 0,
    textAlign: 'center',
  },
  countRow: {
    padding: 12,
    paddingBottom: 0,
    justifyContent: 'space-between',
    flexBasis: 90,
    flexShrink: 0,
    flexDirection: 'row',
  },
  container: {
    overflow: 'scroll-y',
    // height: '100%',
    flex: 0,
    flexShrink: 0,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  dailyChart: {
    height: 400,
    marginHorizontal: 12,
    marginTop: 18,
    overflow: 'visible',
    ...BOX_SHADOW,
  },
});
