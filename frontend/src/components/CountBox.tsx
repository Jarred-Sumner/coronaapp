import * as React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Numeral from 'numeral';
import {COLORS} from '../lib/theme';
import chroma from 'chroma-js';

const styles = StyleSheet.create({
  value: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
    overflow: 'visible',
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: 'normal',
    color: 'white',
    textAlign: 'center',
  },
  item: {
    paddingHorizontal: 12,
    backgroundColor: 'black',
    paddingVertical: 8,

    // backgroundColor: 'rgba(25,25,25,0.75)',
    flexShrink: 1,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {},
});

const CountItem = React.memo(
  ({value, label, color, emptyLabel, showPlus = false}) => {
    if (typeof value === 'number' && value === 0) {
      return (
        <View
          shouldRasterizeIOS
          needsOffscreenAlphaCompositing
          renderToHardwareTextureAndroid
          style={[
            styles.item,
            {
              backgroundColor: chroma(color)
                .alpha(0.25)
                .css(),
            },
          ]}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.label}>
            {emptyLabel}
          </Text>
        </View>
      );
    } else {
      const _value =
        typeof value === 'number'
          ? Numeral(value).format(
              value < 1000 ? `0,0${showPlus ? '+' : ''}` : '0.0a',
            )
          : '-';
      return (
        <View
          shouldRasterizeIOS
          needsOffscreenAlphaCompositing
          renderToHardwareTextureAndroid
          style={[
            styles.item,
            {
              backgroundColor: chroma(color)
                .alpha(0.55)
                .css(),
            },
          ]}>
          <Text numberOfLines={1} style={styles.value}>
            {_value}
          </Text>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        </View>
      );
    }
  },
);

export const CountBox = ({
  recovered = 0,
  dead = 0,
  infected = 0,
  feelingSick = 0,
}) => {
  return (
    <>
      <CountItem
        value={infected}
        label="cases"
        color={COLORS.confirmed}
        emptyLabel="–  cases"
        showPlus
      />
      <CountItem
        value={feelingSick}
        label="self-reported"
        emptyLabel="–  Self-reported"
        color={COLORS.selfReported}
      />
    </>
  );
};
