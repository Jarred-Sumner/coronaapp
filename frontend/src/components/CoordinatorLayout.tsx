import * as React from 'react';
import {View} from 'react-native';

export default ({children, style, sheet}) => (
  <View style={style}>
    {children}
    {sheet}
  </View>
);
