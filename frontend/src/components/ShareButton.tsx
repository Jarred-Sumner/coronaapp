import * as React from 'react';
import Animated from 'react-native-reanimated';
import {BitmapIcon, SHARE} from './BitmapIcons';
import {ListClicker} from './ListClicker';

export const ShareButton = ({onPress}) => (
  <ListClicker onPress={onPress}>
    <Animated.View>
      <BitmapIcon source={SHARE} style={{height: 52, width: 52}} />
    </Animated.View>
  </ListClicker>
);
