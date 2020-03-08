import * as React from 'react';
import {Image, Platform} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {STATS_BUTTON_SOURCE, BitmapIcon} from './BitmapIcons';
import {ListClicker} from './ListClicker';
export const StatsButton = ({onPress}) => (
  <ListClicker onPress={onPress}>
    <Animated.View>
      <BitmapIcon
        source={STATS_BUTTON_SOURCE}
        style={{width: 52, height: 52}}
        resizeMode="contain"
      />
    </Animated.View>
  </ListClicker>
);
