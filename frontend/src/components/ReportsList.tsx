import haversineDistance from 'haversine-distance';
import * as React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {usePaginatedQuery} from 'react-query';
import {fetchReports} from '../api';
import {UserReportListRequest} from '../API_TYPES';
import {useSafeArea} from '../lib/SafeArea';
import {sendSelectionFeedback} from '../lib/Vibration';
import {RegionContext} from '../routes/RegionContext';
import {
  ConfirmedReportListItem,
  CONFIRMED_REPORT_HEIGHT,
} from './ConfirmedReportListItem';
import {CountryContext} from './CountryContext';
import FastList from './FastList';
import {MapContext} from './MapContext';
import {PullyScrollViewContext} from './PullyView';
import {UserLocationContext} from './UserLocationContext';
import {UserReportListItem, USER_REPORT_HEIGHT} from './UserReportListItem';

const styles = StyleSheet.create({
  container: {
    width: '100%',

    flex: 0,
    position: 'relative',
  },
  list: Platform.select({
    ios: {
      flex: 1,
      flexShrink: 0,
      width: '100%',
      overflow: 'visible',
    },
    android: {
      flex: 1,
      flexShrink: 0,

      width: '100%',
      overflow: 'visible',
    },
    web: {
      overflow: 'scroll-y',
    },
  }),

  noResultsFound: {
    textAlign: 'center',

    // color: COLORS.mutedLabel
  },
  listItem: {},
});

const SCROLL_INSETS = {top: 0, left: 0, right: 1, bottom: 0};

const ListComponent = ({
  itemWidth,
  columnCount,
  data = [],
  ListEmptyComponent,
  scrollEnabled = true,
  nativeViewRef,
  sections,
  scrollY,
  height,
  listKey,
  onPress,
  inset,
  translateY,
  relativeLatitude,
  relativeLongitude,
  bottomInset = 0,
  isLoading = false,
  waitFor,
  insetHeight,
  simultaneousHandlers,
  listRef,
  width,
  isModal,
  offset,
  networkStatus,
  ...otherProps
}: {
  data: Array<UserReportListRequest.UserReport>;
}) => {
  const {bottom} = useSafeArea();
  const sectionCounts = React.useMemo(() => [data.length], [data, data.length]);

  const renderRow = React.useCallback(
    (section: number, row: number) => {
      const item = data[row];
      let distance = 0;
      if (relativeLatitude && relativeLongitude) {
        distance = Math.abs(
          haversineDistance(
            {latitude: relativeLatitude, longitude: relativeLongitude},
            {
              latitude: item.latitude,
              longitude: item.longitude,
            },
          ),
        );
      }

      if (item.object === 'user_report') {
        return (
          <UserReportListItem
            wrap
            key={item.id}
            distance={distance}
            width={width - 32}
            report={item}
            onPress={onPress}
          />
        );
      } else if (item.object === 'infection') {
        return (
          <ConfirmedReportListItem
            wrap
            key={item.id}
            distance={distance}
            report={item}
            width={width - 32}
            onPress={onPress}
          />
        );
      }
    },
    [onPress, data, relativeLatitude, relativeLongitude, width],
  );

  const contentInset = React.useMemo(
    () => ({
      top: inset || 0,
      left: 0,
      right: 0,
      bottom: Math.abs((bottomInset * -1 + (isModal ? 0 : bottom)) * -1),
    }),
    [inset, bottomInset, isModal, bottom],
  );
  const contentOffset = React.useMemo(
    () => ({
      y: offset || 0,
      x: 0,
    }),
    [offset],
  );

  const getHeight = React.useCallback(
    (section: number, row: number) => {
      const item = data[row];

      return item.object === 'infection'
        ? CONFIRMED_REPORT_HEIGHT
        : USER_REPORT_HEIGHT;
    },
    [data],
  );

  const renderHeader = React.useCallback(() => {
    return (
      <View pointerEvents="none" style={{height: insetHeight, width: 1}} />
    );
  }, [insetHeight]);

  return (
    // <View pointerEvents="box-none" height={height} style={styles.container}>
    <FastList
      contentInsetAdjustmentBehavior="never"
      keyboardDismissMode="on-drag"
      contentInset={contentInset}
      contentOffset={contentOffset}
      insetBottom={Math.abs(contentInset.bottom) * -1}
      insetTop={contentInset.top}
      disableScrollViewPanResponder={false}
      ref={listRef}
      scrollTopValue={scrollY}
      scrollIndicatorInsets={SCROLL_INSETS}
      // renderHeader={this.props.renderHeader}
      automaticallyAdjustContentInsets={false}
      waitFor={waitFor}
      nativeViewRef={nativeViewRef}
      simultaneousHandlers={simultaneousHandlers}
      keyboardShouldPersistTaps="always"
      isLoading={isLoading}
      renderRow={renderRow}
      scrollY={scrollY}
      containerHeight={height}
      scrollToOverflowEnabled
      scrollEnabled={scrollEnabled}
      overScrollMode="always"
      footerHeight={0}
      isFastList
      stickyHeaders={false}
      style={styles.list}
      // onScrollEnd={this.handleScrollEnd}
      isFastList
      listKey={listKey}
      renderEmpty={ListEmptyComponent}
      rowHeight={getHeight}
      sections={sectionCounts}
    />
    // </View>
  );
};

export const ReportsList = ({
  nativeViewRef,
  scrollEnabled,
  scrollY,
  simultaneousHandlers,
  waitFor,
  horizontal,
  listRef,
  insetHeight,
  width,
  height,
  translateY,
}) => {
  const {moveMap} = React.useContext(MapContext);
  const {latitude, longitude} = React.useContext(UserLocationContext);
  const {region} = React.useContext(RegionContext);
  const {countryCode} = React.useContext(CountryContext);
  const {snapSheet, position} = React.useContext(PullyScrollViewContext);

  const {
    resolvedData: {data: reports = []} = {data: []},
    error,
  } = usePaginatedQuery<UserReportListRequest.Response>(
    [
      'reports',
      {
        countryCode,
        latitude: region.latitude,
        longitude: region.longitude,
        minLatitude: region.minLatitude,
        minLongitude: region.minLongitude,
        maxLatitude: region.maxLatitude,
        maxLongitude: region.maxLongitude,
      },
    ],
    fetchReports,
  );

  const handlePressReport = React.useCallback(
    report => {
      sendSelectionFeedback();
      moveMap({
        latitude: report.latitude,
        longitude: report.longitude,
        altitude: 5000,
      });
      snapSheet('bottom');
    },
    [moveMap, snapSheet],
  );

  return (
    <ListComponent
      data={reports}
      isLoading={!reports}
      nativeViewRef={nativeViewRef}
      scrollY={scrollY}
      relativeLatitude={latitude}
      relativeLongitude={longitude}
      scrollEnabled={horizontal || position === 'top'}
      listKey="REPORTS"
      horizontal={horizontal}
      simultaneousHandlers={simultaneousHandlers}
      waitFor={waitFor}
      onPress={handlePressReport}
      listRef={listRef}
      insetHeight={insetHeight}
      translateY={translateY}
      height={height}
      width={width}
    />
  );
};
