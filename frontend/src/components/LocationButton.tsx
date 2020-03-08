import * as React from 'react';
import {Image, Platform} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {
  SICK_BUTTON_SOURCE,
  BitmapIcon,
  LOCATION_BUTTON_SOURCE,
} from './BitmapIcons';
import {ListClicker} from './ListClicker';

export const LocationButton = ({onPress}) => (
  <ListClicker onPress={onPress}>
    <Animated.View>
      <BitmapIcon
        source={LOCATION_BUTTON_SOURCE}
        style={{width: 52, height: 52}}
      />
    </Animated.View>
  </ListClicker>
);
