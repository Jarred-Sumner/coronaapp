import {
  View,
  findNodeHandle,
  DeviceEventEmitter,
  InteractionManager,
  unstable_createElement,
} from 'react-native';
import {unstable_batchedUpdates} from 'react-dom';
import * as React from 'react';

const ignoreClicks = {
  current: false,
};

if (typeof window !== 'undefined') {
  window.addEventListener(InteractionManager.Events.interactionStart, () => {
    ignoreClicks.current = true;
  });
  window.addEventListener(InteractionManager.Events.interactionComplete, () => {
    ignoreClicks.current = false;
  });
}

export const ListClicker = ({children, onPress, style}) => {
  const ref = React.createRef();

  const clickHandler = React.useCallback(
    event => {
      if (ignoreClicks.current) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      } else {
        let _event = event;
        unstable_batchedUpdates(() => {
          onPress(_event);
          _event = null;
        });
        return true;
      }
    },
    [onPress, ignoreClicks],
  );

  React.useEffect(() => {
    const element = findNodeHandle(ref.current) as Element;
    element.addEventListener('click', clickHandler);
    return () => element.removeEventListener('click', clickHandler);
  }, [ref, clickHandler]);

  return (
    <View style={[style, {cursor: 'pointer'}]} ref={ref}>
      {children}
    </View>
  );
};
