import * as React from 'react';
import {Image} from 'react-native';
import {CLOSE_BUTTON_SOURCE, BitmapIcon} from './BitmapIcons';

export const CloseButtonImage = ({style, ...props}) => (
  <BitmapIcon
    {...props}
    source={CLOSE_BUTTON_SOURCE}
    style={[{width: 40, height: 40}, style]}
  />
);
