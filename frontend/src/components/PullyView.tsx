import * as React from 'react';
import {
  findNodeHandle,
  ScrollView as ScrollViewType,
  Platform,
  View,
} from 'react-native';
import {snapSheetToPosition} from '../lib/Yeet';
import FastList from './FastList';
import {NativePullyView} from './NativePullyView';

type ContextType = {
  setActiveScrollView: (ref) => void;
  posittion: 'top' | 'bottom';
  snapSheet: (position: 'bottom' | 'top') => void;
};
export const PullyScrollViewContext = React.createContext<ContextType>(null);

export const PullyView = ({children, ...props}) => {
  const [activeScrollViewTag, setActiveScrollViewTag] = React.useState(null);
  const [position, setPosition] = React.useState('bottom');
  const pullyRef = React.useRef();
  const scrollViewRef = React.useRef();
  const tabViewRef = React.useRef();

  const snapSheet = React.useCallback(
    (position: 'top' | 'bottom') => {
      const ref = pullyRef.current;

      if (ref) {
        const handle = findNodeHandle(ref);

        snapSheetToPosition(handle, position, ref);
      }
      setPosition(position);
    },
    [pullyRef, snapSheetToPosition, setPosition],
  );

  const handleChangeScrollView = React.useCallback(
    ref => {
      if (ref === null) {
        setActiveScrollViewTag(null);
      } else if (ref?.current instanceof FastList) {
        handleChangeScrollView(ref.current.getScrollView());
      } else if (ref instanceof FastList) {
        handleChangeScrollView(ref.getScrollView());
      } else if (typeof ref?.current?.getNode === 'function') {
        scrollViewRef.current = ref.current;
        handleChangeScrollView(ref.current.getNode());
      } else if (typeof ref?.current !== 'undefined') {
        console.log(
          'GOT',
          (ref.current as ScrollViewType)?.scrollResponderGetScrollableNode(),
        );
        scrollViewRef.current = ref;
        setActiveScrollViewTag(
          (ref.current as ScrollViewType)?.scrollResponderGetScrollableNode(),
        );
      } else if ((ref as ScrollViewType)?.scrollResponderGetScrollableNode()) {
        console.log(
          'GOT IT!',
          (ref as ScrollViewType)?.scrollResponderGetScrollableNode(),
        );
        scrollViewRef.current = ref;
        setActiveScrollViewTag(
          (ref as ScrollViewType)?.scrollResponderGetScrollableNode(),
        );
      } else {
        scrollViewRef.current = null;
        setActiveScrollViewTag(null);
      }
    },
    [scrollViewRef, setActiveScrollViewTag],
  );

  const setTabViewRef = React.useCallback(
    ref => {
      tabViewRef.current = ref.current;
    },
    [tabViewRef],
  );

  const contextValue = React.useMemo(
    () => ({
      setActiveScrollView: handleChangeScrollView,
      snapSheet,
      position,
      setTabViewRef,
    }),
    [handleChangeScrollView, snapSheet, setTabViewRef, position],
  );

  return (
    <PullyScrollViewContext.Provider value={contextValue}>
      <NativePullyView
        onChangePosition={setPosition}
        position={Platform.select({
          ios: undefined,
          android: position,
          web: position,
        })}
        ref={pullyRef}
        scrollViewTag={activeScrollViewTag}
        tabViewRef={tabViewRef}
        scrollViewRef={scrollViewRef}
        {...props}>
        {children}
      </NativePullyView>
    </PullyScrollViewContext.Provider>
  );
};
