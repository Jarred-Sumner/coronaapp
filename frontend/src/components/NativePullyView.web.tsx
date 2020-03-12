import * as React from 'react';
import {
  Directions,
  FlingGestureHandler,
  FlingGestureHandlerGestureEvent,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {Easing} from 'react-native-reanimated';
import {clamp, onGestureEvent, timing, withSpring} from 'react-native-redash';
import {SCREEN_DIMENSIONS} from './ScreenSize';
import {InteractionManager, Platform, View, StyleSheet} from 'react-native';

const {
  Clock,
  Value,
  cond,
  useCode,
  set,
  block,
  not,
  clockRunning,
  interpolate,
  diffClamp,
  Extrapolate,
} = Animated;

const style = StyleSheet.create({
  container: {},
});

const {height} = SCREEN_DIMENSIONS;
const MINIMIZED_PLAYER_HEIGHT = 42;
const SNAP_BOTTOM = height - 350;
const SNAP_TOP = -1;
const config: Animated.SpringConfig = {
  damping: 30,
  mass: 1,
  stiffness: 150,
  overshootClamping: true,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export class NativePullyView extends React.Component {
  velocityY = new Value(0);
  gestureState = new Value(State.UNDETERMINED);
  offset = new Value(SNAP_BOTTOM);
  goUp: Animated.Value<0 | 1> = new Value(0);
  goDown: Animated.Value<0 | 1> = new Value(0);
  translationY = new Value(0);

  gestureEvents = onGestureEvent({
    state: this.gestureState,
    translationY: this.translationY,
    velocityY: this.velocityY,
  });
  state = {position: 'bottom'};
  clock = new Clock();

  translateY = clamp(
    withSpring({
      value: this.translationY,
      velocity: this.velocityY,
      offset: this.offset,
      state: this.gestureState,
      snapPoints: [SNAP_BOTTOM, SNAP_TOP],
      config,
    }),
    0,
    SNAP_BOTTOM,
  );
  setPosition = position => this.props.onChangePosition(position);

  setSnapToTop = () => this.setPosition('top');
  setSnapToBottom = () => this.setPosition('bottom');

  waitFor = [];

  _scrollRef = React.createRef();
  componentDidUpdate(prevProps, prevState) {
    const {scrollViewTag, tabViewRef, positio} = this.props;
    if (scrollViewTag !== prevProps.scrollViewTag) {
    }

    this.tabViewPagerRef.current = tabViewRef.current?.getNode();
  }

  tabViewPagerRef = React.createRef();

  configureHandlers = () => {
    this.panHandlers = [
      this.props.scrollViewTag,
      this.flingRef,
      this.tabViewPagerRef,
    ];
    this.flingHandlers = [
      this.props.scrollViewTag,
      this.flingRef,
      this.tabViewPagerRef,
    ];
  };

  snapSheetToBottom = () => {
    console.log('BOTTOM');
    window.requestAnimationFrame(() => {
      this.goDown.setValue(1);
    });
  };

  snapSheetToTop = () => {
    console.log('TOP');
    this.goUp.setValue(1);
  };

  panRef = React.createRef();
  flingRef = React.createRef();
  panHandlers = [];
  flingHandlers = [];

  animationFrame: number | null = null;

  handleGestureEvent = (event: FlingGestureHandlerGestureEvent) => {
    const {state} = event.nativeEvent;

    if (state === State.END || state === State.FAILED) {
      if (!this.props.position === 'top') {
        return;
      }

      if (this.animationFrame) {
        return;
        // window.cancelAnimationFrame(this.animationFrame);
        // this.animationFrame = null;
      }

      const isPositiveVelocity = event.nativeEvent.velocityY > 0;

      this.animationFrame = window.requestAnimationFrame(() => {
        if (!this.props.position === 'top') {
          return;
        }

        const scroller = this.props.scrollViewTag;

        if (!scroller) {
          return;
        }

        const scrollTop = scroller.scrollTop;

        const isScrolledToTop = scrollTop <= 0 && isPositiveVelocity;
        console.log({VALUE: this.goDown._value});
        if (isScrolledToTop && this.goDown._value === 0) {
          this.goDown.setValue(1);
        }
        this.animationFrame = null;
      });
    }
  };

  rootStyle = {
    zIndex: 9999,
    position: Platform.select({
      web: 'fixed',
      ios: 'absolute',
      android: 'absolute',
    }),
    top: 0,
    height: '100%',
    transform: [{translateY: this.translateY}],
  };
  // handleGestureEvent = debounce(this._handleGestureEvent, 16);

  _interactionHandle: number | null = null;
  updateInteractionHandle = ([gestureState]) => {
    if (gestureState === State.ACTIVE) {
      console.log('SET INTERACTION');
      if (!this._interactionHandle) {
        this._interactionHandle = InteractionManager.createInteractionHandle();
      }
    } else if (
      gestureState === State.CANCELLED ||
      gestureState === State.END ||
      gestureState === State.FAILED
    ) {
      console.log('CLEAR INTERACTION');
      if (this._interactionHandle) {
        InteractionManager.clearInteractionHandle(this._interactionHandle);
        this._interactionHandle = null;
      }
    }
  };

  render() {
    const {
      children,
      scrollViewTag,
      scrollViewRef,
      tabViewRef,
      position,
      onChangePosition,
      horizontal = false,
    } = this.props;

    const {
      translateY,
      setSnapToTop,
      setSnapToBottom,
      goUp,
      offset,
      clock,
      waitFor,
      translationY,
      goDown,
    } = this;

    if (!horizontal) {
      return (
        <PanGestureHandler
          enabled={position === 'bottom'}
          ref={this.panRef}
          simultaneousHandlers={this.panHandlers}
          {...this.gestureEvents}>
          <Animated.View style={this.rootStyle}>
            <Animated.Code
              exec={block([
                Animated.onChange(
                  this.gestureState,
                  Animated.call(
                    [this.gestureState],
                    this.updateInteractionHandle,
                  ),
                ),
                Animated.onChange(
                  Animated.eq(translateY, 0),
                  Animated.block([
                    Animated.cond(
                      Animated.eq(translateY, 0),
                      Animated.call([], setSnapToTop),
                    ),
                  ]),
                ),
                Animated.onChange(
                  Animated.eq(translateY, SNAP_BOTTOM),
                  Animated.block([
                    Animated.cond(
                      Animated.eq(translateY, SNAP_BOTTOM),
                      Animated.call([], setSnapToBottom),
                    ),
                  ]),
                ),

                cond(goDown, [
                  set(
                    offset,
                    timing({
                      clock,
                      from: offset,
                      easing: Easing.elastic(0.5),
                      to: SNAP_BOTTOM,
                    }),
                  ),
                  Animated.cond(not(clockRunning(clock)), [
                    set(goDown, 0),
                    Animated.call([goDown], this.setSnapToBottom),
                  ]),
                ]),
              ])}
            />
            <FlingGestureHandler
              enabled={position === 'top'}
              ref={this.flingRef}
              direction={Directions.DOWN}
              simultaneousHandlers={this.flingHandlers}
              onHandlerStateChange={this.handleGestureEvent}>
              <Animated.View>{children}</Animated.View>
            </FlingGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      );
    } else {
      return <View style={{flexShrink: 1}}>{children}</View>;
    }
  }
}

export default NativePullyView;
