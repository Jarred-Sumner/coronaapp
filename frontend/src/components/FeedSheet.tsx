import * as React from 'react';
import {StyleSheet, View, useWindowDimensions} from 'react-native';
import {useSafeArea} from '../lib/SafeArea';
import {getItem} from '../lib/Yeet';
import FeedTabView from './FeedTabView';
import {SCREEN_DIMENSIONS} from './ScreenSize';
import {ListClicker} from './ListClicker';
import {PullyScrollViewContext} from './PullyView';
import Animated from 'react-native-reanimated';
import {CloseButtonImage} from './CloseButtonImage';
import ReactTooltip from 'react-tooltip';

const styles = StyleSheet.create({
  header: {},
  clicker: {
    position: 'absolute',
    left: 16,
  },
});

export const FeedSheet = ({horizontal}) => {
  const {top, bottom} = useSafeArea();
  const initialRoute = React.useRef();
  const {width: _width, height: _height} = useWindowDimensions();
  let width = _width;
  let height = _height;

  if (horizontal) {
    width = Math.max(Math.min(512, _width - 300), 200);
  }

  React.useEffect(() => {
    initialRoute.current = getItem('FEED_SHEET_INITIAL_ROUTE', 'string');
  }, [initialRoute]);

  const {snapSheet, position} = React.useContext(PullyScrollViewContext) ?? {};
  const dismiss = React.useCallback(() => {
    console.log('DISMISS');
    return snapSheet('bottom');
  }, [snapSheet]);

  if (horizontal) {
    return (
      <View
        style={{
          width,
          height,
          shadowOffset: {width: -2, height: 2},
          overflow: 'visible',
          shadowColor: 'black',
          shadowOpacity: 0.25,
          shadowRadius: 15,
        }}>
        <FeedTabView
          scrollEnabled
          offset={0}
          headerHeight={0}
          horizontal={horizontal}
          height={height}
          initialRoute={initialRoute.current}
          width={width}
        />

        <ReactTooltip style={{cursor: 'pointer'}} multiline />
      </View>
    );
  }

  return (
    <View
      style={{
        height: height - top - bottom,
        width,
      }}>
      <View
        style={{
          // marginTop: top,
          shadowColor: 'black',
          shadowRadius: 2,
          shadowOpacity: 0.25,
          height: height - top - bottom,
          width,
        }}>
        <View
          style={{
            height: height - top - bottom,
            width,
            overflow: 'hidden',
            borderRadius: 12,
            position: 'relative',
          }}>
          <FeedTabView
            scrollEnabled
            offset={0}
            headerHeight={0}
            horizontal={horizontal}
            height={height - top - bottom - 16}
            initialRoute={initialRoute.current}
            width={width}
          />

          {!horizontal && (
            <View
              style={[
                styles.clicker,
                {
                  bottom: bottom + 32,
                  left: 32,
                  zIndex: 999,
                  width: 48,
                  height: 48,
                },
              ]}>
              <ListClicker onPress={dismiss}>
                <Animated.View style={{elevation: 100}}>
                  <CloseButtonImage />
                </Animated.View>
              </ListClicker>
            </View>
          )}
        </View>
      </View>

      <ReactTooltip
        style={{cursor: 'pointer'}}
        multiline
        resizeHide
        effect="solid"
        globalEventOff={!horizontal ? 'touchstart' : undefined}
      />
    </View>
  );
};
