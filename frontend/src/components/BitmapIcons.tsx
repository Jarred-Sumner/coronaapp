import * as React from 'react';
import {ImageProps, Image} from 'react-native';

export const SICK_BUTTON_SOURCE = {
  uri: 'SickButton',
  width: 71,
  height: 72,
};

export const STATS_BUTTON_SOURCE = {
  uri: 'Graphs',
  width: 71,
  height: 72,
};

export const CHEVRON_DOWN = {
  uri: 'ChevronDown',
  width: 12,
  height: 8,
};

export const CHECK = {
  uri: 'Check',
  width: 20,
  height: 16,
};

export const CLOSE_BUTTON_SOURCE = {
  uri: 'CloseButton',
  width: 40,
  height: 40,
};

export const LOCATION_BUTTON_SOURCE = {
  uri: 'Location',
  width: 71,
  height: 72,
};

export const BitmapIcon = React.forwardRef((props: ImageProps, ref) => {
  return <Image {...props} ref={ref} />;
});
