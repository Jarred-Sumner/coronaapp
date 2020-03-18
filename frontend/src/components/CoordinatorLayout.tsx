import * as React from 'react';
import {unstable_createElement} from 'react-native';

export default ({children, style, sheet}) =>
  unstable_createElement(
    'div',
    {
      id: 'Layout',
    },
    <>
      {children}
      {sheet}
    </>,
  );
