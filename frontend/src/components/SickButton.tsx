import * as React from 'react';
import Animated from 'react-native-reanimated';
import {BitmapIcon, SICK_BUTTON_SOURCE} from './BitmapIcons';
import {ListClicker} from './ListClicker';

export const SickButton = ({onPress}) => (
  <ListClicker onPress={onPress}>
    <Animated.View>
      <BitmapIcon source={SICK_BUTTON_SOURCE} style={{height: 52, width: 52}} />
    </Animated.View>
  </ListClicker>
);
