import * as React from 'react';
import {View} from 'react-native';
import {
  CoordinatorLayout,
  BackdropBottomSheet,
  BottomSheetBehavior,
} from 'react-native-bottom-sheet-behavior';
import {SCREEN_DIMENSIONS} from './ScreenSize';

export default ({style, children, sheet}) => (
  <CoordinatorLayout>
    <View style={style}>{children}</View>
    <BackdropBottomSheet height={SCREEN_DIMENSIONS.height} />
    {sheet}
  </CoordinatorLayout>
);
