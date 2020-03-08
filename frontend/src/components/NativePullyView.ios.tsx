import * as React from 'react';
import {requireNativeComponent, ViewProps} from 'react-native';

const RawNativePullyView = requireNativeComponent(
  'PullyView',
) as React.ComponentType<ViewProps>;

export const NativePullyView = React.forwardRef((_props, ref) => {
  const {onChangePosition, ...props} = _props;
  const handlePositionChange = React.useCallback(
    ({nativeEvent: {position}}) => {
      onChangePosition && onChangePosition(position);
    },
    [onChangePosition],
  );

  return (
    <RawNativePullyView
      {...props}
      ref={ref}
      onChangePosition={handlePositionChange}
    />
  );
});
