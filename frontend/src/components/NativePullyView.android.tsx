import * as React from 'react';
import {SCREEN_DIMENSIONS} from './ScreenSize';
import {View, BackHandler} from 'react-native';
import {debounce} from 'lodash';
import {
  CoordinatorLayout,
  BottomSheetBehavior,
} from 'react-native-bottom-sheet-behavior';

const {height} = SCREEN_DIMENSIONS;

export class NativePullyView extends React.Component {
  setPosition = position => this.props.onChangePosition(position);

  setSnapToTop = () => this.setPosition('top');
  setSnapToBottom = () => this.setPosition('bottom');

  waitFor = [];

  _scrollRef = React.createRef();
  componentDidUpdate(prevProps, prevState) {
    const {scrollViewTag, tabViewRef, positio} = this.props;
    if (scrollViewTag !== prevProps.scrollViewTag && scrollViewTag) {
      this.bottomSheetRef.current?.attachNestedScrollChild(scrollViewTag);
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
      // this.goDown.setValue(1);
    });
  };

  snapSheetToTop = () => {
    console.log('TOP');
    // this.goUp.setValue(1);
  };

  panRef = React.createRef();
  flingRef = React.createRef();
  panHandlers = [];
  flingHandlers = [];

  animationFrame: number | null = null;

  // handleGestureEvent = debounce(this._handleGestureEvent, 16);

  _interactionHandle: number | null = null;
  handlePositionChange = event =>
    this.props.onChangePosition(
      event.nativeEvent.state === BottomSheetBehavior.STATE_EXPANDED
        ? 'top'
        : 'bottom',
    );

  bottomSheetRef = React.createRef();

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleHardwarePress);
  }

  updatePosition = position => {
    return this.bottomSheetRef?.current?.setBottomSheetState(
      {
        top: BottomSheetBehavior.STATE_EXPANDED,
        bottom: BottomSheetBehavior.STATE_COLLAPSED,
      }[position] || BottomSheetBehavior.STATE_COLLAPSED,
    );
  };

  handleHardwarePress = () => {
    const {position} = this.props;

    if (position === 'top') {
      this.updatePosition('bottom');
      return true;
    } else {
      return false;
    }
  };

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleHardwarePress,
    );
  }

  handleSlide = ({nativeEvent: {offset}}) => {
    if (offset === 0) {
      this.handlePositionChange({
        nativeEvent: {state: BottomSheetBehavior.STATE_COLLAPSED},
      });
    } else if (offset === 1) {
      this.handlePositionChange({
        nativeEvent: {state: BottomSheetBehavior.STATE_EXPANDED},
      });
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
    } = this.props;

    return (
      <BottomSheetBehavior
        peekHeight={350}
        hideable={false}
        elevation={100}
        anchorEnabled={false}
        ref={this.bottomSheetRef}
        // onStateChange={this.handlePositionChange}
        onSlide={this.handleSlide}
        style={{elevation: 100}}
        state={
          {
            top: BottomSheetBehavior.STATE_EXPANDED,
            bottom: BottomSheetBehavior.STATE_COLLAPSED,
          }[position]
        }>
        <View style={{flex: 1}}>{children}</View>
      </BottomSheetBehavior>
    );
  }
}

export default NativePullyView;
