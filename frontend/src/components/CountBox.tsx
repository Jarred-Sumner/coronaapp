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
    marginRight: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: 'normal',
    color: 'white',
    textAlign: 'center',
  },
  item: {
    paddingHorizontal: 12,
    marginHorizontal: 12,
    backgroundColor: 'black',
    borderRadius: 16,
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
                .alpha(0.25)
                .css(),
            },
          ]}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.value}>
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
        label="Cases"
        color={COLORS.confirmed}
        emptyLabel="0  confirmed here."
        showPlus
      />
      <CountItem
        value={feelingSick}
        label="Self-reported"
        emptyLabel="–  Self-reported"
        color={COLORS.selfReported}
      />
    </>
  );
};
