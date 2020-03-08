import * as React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {RectButton, BaseButton} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {CONTENT_WIDTH} from './CONTENT_WIDTH';
import {COLORS} from '../lib/theme';

const styles = StyleSheet.create({
  background: {
    borderRadius: 4,
    width: CONTENT_WIDTH,
    height: 48,

    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    backgroundColor: '#43566F',
  },
  label: {
    fontSize: 18,

    fontWeight: '600',
    color: 'white',
  },
});

export const TwitterFollowButton = ({onPress}) => {
  return (
    <View>
      <BaseButton onPress={onPress}>
        <Animated.View style={styles.background}>
          <Text style={styles.label}>Follow us on Twitter</Text>
        </Animated.View>
      </BaseButton>
    </View>
  );
};
