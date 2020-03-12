import * as React from 'react';
import Animated from 'react-native-reanimated';
import {BitmapIcon, SICK_BUTTON_SOURCE} from './BitmapIcons';
import {ListClicker} from './ListClicker';

export const SickButton = ({onPress}) => (
  <ListClicker style={{height: 52, width: 52, flex: 0}} onPress={onPress}>
    <Animated.View style={{height: 52, width: 52, flex: 0}}>
      <BitmapIcon source={SICK_BUTTON_SOURCE} style={{height: 52, width: 52}} />
    </Animated.View>
  </ListClicker>
);
