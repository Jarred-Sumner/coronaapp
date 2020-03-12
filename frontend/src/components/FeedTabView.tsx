import * as React from 'react';
import {findNodeHandle, StyleSheet, View, Platform} from 'react-native';
import Animated from 'react-native-reanimated';
import {TabView, ScrollPager} from 'react-native-tab-view';

import {COLORS} from '../lib/theme';
import {setItem} from '../lib/Yeet';
import {FeedList} from './FeedList';
import {PullyScrollViewContext} from './PullyView';
import {ReportsList} from './ReportsList';
import {SCREEN_DIMENSIONS} from './ScreenSize';
// import {SCREEN_DIMENSIONS} from '../../../config';
// import {sendSelectionFeedback} from '../../lib/Vibration';
import {SheetHeader} from './SheetHeader';

// const ViewPager = createNativeWrapper(_ViewPager, {
//   disallowInterruption: false,
// }) as React.ComponentType<ViewPagerProps & NativeViewGestureHandlerProperties>;

const styles = StyleSheet.create({
  sceneContainer: {
    overflow: 'visible',
    backgroundColor: COLORS.dark,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,

    overflow: 'visible',
  },
});

type GallerySectionItem = 'news' | 'reports';
export const DEFAULT_TABS = ['news', 'reports'];
export const ROUTE_LIST = DEFAULT_TABS;

type Props = {
  initialRoute: GallerySectionItem;
  routes: Array<GallerySectionItem>;
  tabBarPosition: 'top' | 'bottom';
  inset: number;
  headerHeight: Function;
  width: number;
  height: number;
  bottomInset: number;
  offset: number;
  query: string;
  renderHeader: Function;
  scrollY: Animated.Value<number>;
  position: Animated.Value<number>;
};

class FeedTabViewComponent extends React.Component<Props, {page: number}> {
  constructor(props) {
    super(props);

    this.initialLayout = {
      width: props.width,
      height: props.height,
    };

    this.state = {
      navigationState: {
        routes: props.routes.map(route => ({key: route, title: route})),
        index: this.initialPage,
      },
      page: this.initialPage,
    };
    this.loadedScreens = new Set([this.currentRoute]);
  }

  get initialPage() {
    return Math.max(this.props.routes.indexOf(this.props.initialRoute), 0);
  }

  position = new Animated.Value(0);
  loadedScreens: Set<GallerySectionItem>;

  static defaultProps = {
    initialRoute: 'all',
    routes: ROUTE_LIST,
    tabBarPosition: 'top',
    inset: 0,
    headerHeight: 0,
    width: SCREEN_DIMENSIONS.width,
    height: 0,
    bottomInset: 0,
    simultaneousHandlers: [],
    offset: 0,
  };

  viewPagerRef = React.createRef<ViewPager>();

  componentDidMount() {
    const {viewPagerRef} = this;

    // if (viewPagerRef.current) {
    //   this.onPageScrollEvent.attachEvent(
    //     findNodeHandle(this.viewPagerRef.current),
    //     'onPageScroll',
    //   );
    // }

    this.props?.setActiveScrollView(this.activeListRef);
  }

  componentWillUnmount() {
    const {viewPagerRef} = this;
  }

  newsRef = React.createRef();
  newsScrollRef = React.createRef();
  reportsRef = React.createRef();
  reportsScrollRef = React.createRef();

  routesToRef = {
    news: this.newsRef,
    reports: this.reportsRef,
  };

  get currentRoute() {
    return this.props.routes[this.state.page];
  }

  simultaneousHandlers = this.viewPagerRef;

  get viewPagerSimultaneousHandlers() {
    return [this.newsScrollRef, this.reportsScrollRef];
  }

  waitFor = this.props.waitFor;

  get activeListRef() {
    return this.routesToRef[this.currentRoute].current;
  }

  renderScene = ({route: {key: route}}) => {
    const {
      width,
      height,
      isKeyboardVisible,
      onPress,
      keyboardVisibleValue,
      selectedIDs,
      horizontal,
      // isFocused,
      renderHeader,
      headerHeight,
      query,
      ...otherProps
    } = this.props;

    const currentRoute = this.currentRoute;
    const isFocused = this.props.isFocused && currentRoute === route;

    switch (route) {
      case 'news':
        return (
          <FeedList
            listRef={this.newsRef}
            simultaneousHandlers={this.simultaneousHandlers}
            isFocused={isFocused}
            waitFor={this.waitFor}
            onPress={onPress}
            insetValue={this.props.insetValue}
            height={height}
            renderHeader={renderHeader}
            headerHeight={headerHeight}
            offset={this.props.offset}
            query={query}
            bottomInset={this.props.bottomInset}
            width={this.props.width}
            horizontal={horizontal}
            selectedIDs={selectedIDs}
            isModal={this.props.isModal}
            inset={this.props.inset}
            scrollY={this.props.scrollY}
            keyboardVisibleValue={keyboardVisibleValue}
          />
        );
      case 'reports':
        return (
          <ReportsList
            listRef={this.reportsRef}
            simultaneousHandlers={this.simultaneousHandlers}
            waitFor={this.waitFor}
            isFocused={isFocused}
            onPress={onPress}
            insetValue={this.props.insetValue}
            height={height}
            renderHeader={renderHeader}
            headerHeight={headerHeight}
            horizontal={horizontal}
            offset={this.props.offset}
            width={this.props.width}
            query={query}
            bottomInset={this.props.bottomInset}
            selectedIDs={selectedIDs}
            isModal={this.props.isModal}
            inset={this.props.inset}
            scrollY={this.props.scrollY}
            keyboardVisibleValue={keyboardVisibleValue}
          />
        );
      default: {
        throw Error(`Invalid route: ${route}`);
        return null;
      }
    }
  };

  handleChangeRoute = route => {
    const index = this.props.routes.indexOf(route);

    if (index < 0) {
      return;
    }

    if (!this.viewPagerRef.current) {
      return;
    }

    this.viewPagerRef.current.setPage(index);
    // sendSelectionFeedback();
    window.requestAnimationFrame(() => this.onIndexChange(index));
  };

  initialLayout: {width: number; height: number};

  onIndexChange = index => {
    if (this.routesToRef[index]) {
      this.props.setActiveScrollView(this.routesToRef[index].current);
      this.newsScrollRef.current = this.reportsRef.current
        ?.getScrollView()
        ?.scrollResponderGetScrollableNode();

      this.reportsScrollRef.current = this.reportsRef.current
        ?.getScrollView()
        ?.scrollResponderGetScrollableNode();
    }

    this.loadedScreens.add(this.props.routes[index]);
    this.setState({
      page: index,
      navigationState: {...this.state.navigationState, index},
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      this.props.setActiveScrollView(this.activeListRef);

      setItem('FEED_SHEET_INITIAL_ROUTE', this.currentRoute, 'string');
    }
  }

  onPageSelected = ({
    nativeEvent,
  }: {
    nativeEvent: ViewPagerOnPageSelectedEventData;
  }) => {
    this.onIndexChange(nativeEvent.position);
  };

  tabViewRef = React.createRef();
  renderTabBar = props => {
    return (
      <SheetHeader
        tabs={this.props.routes}
        position={props.position}
        width={this.props.width}
        inset={0}
        value={props.navigationState.routes[props.navigationState.index].key}
        onChange={props.jumpTo}
      />
    );
  };

  get currentRef() {
    return this.routesToRef[this.currentRoute];
  }

  renderSceneContainer = route => {
    return (
      <View
        key={route}
        style={[
          styles.sceneContainer,
          {
            height: this.props.height,
            width: this.props.width,
          },
        ]}>
        {this.renderScene(route)}
      </View>
    );
  };

  setViewPagerRef = ref => {
    this.viewPagerRef.current = ref;

    if (Platform.OS === 'web') {
      this.props.setTabViewRef(this.pagerRef.current.scrollViewRef);
    }
  };

  pagerRef = React.createRef<ScrollPager<any>>();
  renderPager = props => <ScrollPager ref={this.pagerRef} {...props} />;

  render() {
    const {
      width,
      height,
      horizontal,
      tabBarPosition,
      routes,
      position,
      pullyPosition,
    } = this.props;

    return (
      <TabView
        transitionStyle="scroll"
        style={[styles.container, {width, flexBasis: width}]}
        orientation="horizontal"
        onPageSelected={this.onPageSelected}
        ref={this.setViewPagerRef}
        onIndexChange={this.onIndexChange}
        initialLayout={this.initialLayout}
        renderTabBar={this.renderTabBar}
        lazy
        pageMargin={0}
        renderPager={Platform.select({
          ios: undefined,
          android: undefined,
          web: this.renderPager,
        })}
        keyboardDismissMode="none"
        tabBarPosition="top"
        swipeEnabled={
          horizontal
            ? true
            : Platform.select({
                web: pullyPosition === 'top',
                android: true,
              })
        }
        gestureHandlerProps={{
          waitFor: this.viewPagerSimultaneousHandlers,
        }}
        sceneContainerStyle={styles.sceneContainer}
        initialPage={this.initialPage}
        navigationState={this.state.navigationState}
        renderScene={this.renderSceneContainer}
        showPageIndicator={false}></TabView>
    );
  }
}

export const FeedTabView = React.memo(props => {
  const {setActiveScrollView, setTabViewRef, position = 'bottom'} =
    React.useContext(PullyScrollViewContext) ?? {};
  return (
    <FeedTabViewComponent
      {...props}
      pullyPosition={position}
      setActiveScrollView={setActiveScrollView}
      setTabViewRef={setTabViewRef}
    />
  );
});

FeedTabView.defaultProps = FeedTabViewComponent.defaultProps;

export default FeedTabView;
