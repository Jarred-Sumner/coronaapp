import * as React from 'react';
import Animated from 'react-native-reanimated';
import {BitmapIcon, SHARE} from './BitmapIcons';
import {ListClicker} from './ListClicker';

export const ShareButton = ({onPress}) => (
  <ListClicker style={{height: 52, width: 52, flex: 0}} onPress={onPress}>
    <Animated.View style={{height: 52, width: 52, flex: 0}}>
      <BitmapIcon source={SHARE} style={{height: 52, width: 52}} />
    </Animated.View>
  </ListClicker>
);
