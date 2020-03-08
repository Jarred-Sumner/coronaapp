import * as React from 'react';
import {BaseButton} from 'react-native-gesture-handler';

export const ListClicker = ({children, onPress, style}) => (
  <BaseButton
    onPress={onPress}
    style={style}
    disallowInterruption={false}
    shouldActivateOnStart={false}
    shouldCancelWhenOutside>
    {children}
  </BaseButton>
);
