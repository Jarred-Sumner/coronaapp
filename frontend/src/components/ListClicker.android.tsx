import * as React from 'react';
import {StyleSheet} from 'react-native';
import {BaseButton} from 'react-native-gesture-handler';

export const ListClicker = ({children, onPress, style}) => (
  <BaseButton
    onPress={onPress}
    style={style}
    disallowInterruption={false}
    shouldActivateOnStart={false}
    enabled
    shouldCancelWhenOutside>
    {children}
  </BaseButton>
);
