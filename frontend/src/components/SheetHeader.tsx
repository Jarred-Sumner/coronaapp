import * as React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {useSafeArea} from '../lib/SafeArea';
import {SCREEN_DIMENSIONS} from './ScreenSize';
import {SheetHeaderRow as Row} from './SheetHeaderRow';
import {COLORS} from '../lib/theme';

const HEADER_HEIGHT = 48;
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.dark,
    height: HEADER_HEIGHT,
    zIndex: 9999,
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,

    shadowRadius: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    overflow: 'visible',
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.11)',
    flexBasis: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  headerText: {
    fontSize: 13,
    textAlign: 'center',
  },
  activeRow: {
    opacity: 1,
    borderRightColor: 'transparent',
  },
  row: {
    opacity: 0.65,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightRow: {height: 60},

  rowWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorCircle: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  lightIndicator: {
    bottom: 3,
  },
  bottomIndicator: {
    top: 3,
  },
});

export const SheetHeader = ({
  position,
  onChange,
  value,
  light,
  hidden = false,
  rightInset = 0,
  tabs,
  icons = false,
  inset,

  indicatorWidth: _indicatorWidth,
  width: containerWidth,
  tabBarPosition,
}) => {
  const width = (containerWidth - inset) / tabs.length;
  const count = tabs.length;
  const {top} = useSafeArea();
  const _inset = light ? 8 : 0;
  const indicatorWidth = width;

  const indicatorStyles = React.useMemo(
    () => [
      styles.indicator,
      {width: indicatorWidth},
      {
        bottom: 0,
        left: 0,
        height: 2,
        right: 0,
        backgroundColor: 'white',

        transform: [
          {translateX: inset},
          {
            translateX: Platform.select({
              ios: Animated.multiply(position, width),
              android: Animated.multiply(position, width),
              web: width * tabs.indexOf(value),
            }),
          },
        ],
      },
    ],
    [position, width, inset, indicatorWidth, styles, value],
  );

  const IndicatorView = Platform.select({
    ios: Animated.View,
    android: Animated.View,
    web: View,
  });

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {height: HEADER_HEIGHT, width: containerWidth},
      ]}>
      {inset > 0 && <View style={{width: inset, height: 1}} />}
      <Row
        onPress={onChange}
        iconOnly={icons}
        isActive={value === 'stats'}
        inset={inset}
        value={'stats'}
        light={light}
        isLast
        size={{width}}>
        Stats
      </Row>

      <Row
        onPress={onChange}
        iconOnly={icons}
        isActive={value === 'news'}
        inset={inset}
        value={'news'}
        light={light}
        size={{width}}>
        News
      </Row>

      <Row
        onPress={onChange}
        iconOnly={icons}
        isActive={value === 'reports'}
        inset={inset}
        value={'reports'}
        light={light}
        isLast
        size={{width}}>
        Logs
      </Row>

      <IndicatorView style={indicatorStyles} />
    </View>
  );
};

export default SheetHeader;
