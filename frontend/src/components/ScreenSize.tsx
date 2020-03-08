import {Dimensions, Platform} from 'react-native';

export const SCREEN_DIMENSIONS = Dimensions.get('window');

export const isDesktop = Platform.select({
  ios: false,
  android: false,
  web: SCREEN_DIMENSIONS.width > 600,
});

export const isMobile = !isDesktop;
