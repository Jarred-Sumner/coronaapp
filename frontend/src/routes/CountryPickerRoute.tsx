import {useNavigation} from '@react-navigation/core';
import Numeral from 'numeral';
import * as React from 'react';
import {StyleSheet, Text, View, Platform} from 'react-native';
import {BorderlessButton} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import useSWR from 'swr';
import {apiFetcher, COUNTRIES_URL, TOTALS_URL} from '../api';
import {CountryEndpoint, TotalEndpoint} from '../API_TYPES';
import {CloseButtonImage} from '../components/CloseButtonImage';
import {CountryContext} from '../components/CountryContext';
import FastList from '../components/FastList';
import {ListClicker} from '../components/ListClicker';
import {SCREEN_DIMENSIONS} from '../components/ScreenSize';
import {getCode} from '../lib/getCountry';
import {sendSelectionFeedback} from '../lib/Vibration';

const {height: SCREEN_HEIGHT} = SCREEN_DIMENSIONS;

const SELECTED_COLOR = '#0091FF';
const SCROLL_INSETS = {top: 0, left: 0, right: 1, bottom: 0};

const headerStyles = StyleSheet.create({
  header: {
    position: 'relative',
    height: 64,
    width: '100%',
    zIndex: 10,
    flex: 0,
    flexDirection: 'row',
    paddingVertical: 20,
    backgroundColor: 'black',
    justifyContent: 'center',
  },

  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  headerLabel: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  closeButtonView: {
    padding: 8,
  },
  closeButtonText: {},
});

const Header = () => {
  const {goBack} = useNavigation();
  const {country} = React.useContext(CountryContext);

  return (
    <View style={[headerStyles.header, {paddingTop: 16}]}>
      <View style={headerStyles.headerLabel}>
        <Text style={headerStyles.title}>Country/Region</Text>
      </View>
      <View style={headerStyles.closeButton}>
        <BorderlessButton onPress={goBack}>
          <Animated.View style={headerStyles.closeButtonView}>
            <CloseButtonImage />
          </Animated.View>
        </BorderlessButton>
      </View>
    </View>
  );
};

const ROW_HEIGHT = 40 + 16;
const SECTION_HEADER_HEIGHT = 24;

const listItemStyles = StyleSheet.create({
  container: {
    height: ROW_HEIGHT,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    width: '100%',
  },
  icon: {
    width: 40,
    marginRight: 20,
  },
  label: {
    flex: 1,
    fontSize: 18,
    color: 'white',
  },
  confirmedCount: {
    color: SELECTED_COLOR,
    fontSize: 18,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    height: SECTION_HEADER_HEIGHT,
    paddingHorizontal: 16,
  },
  sectionHeaderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ccc',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    height: ROW_HEIGHT,
  },
});

const CountryListItem = React.memo(
  ({country, countryCode, label, count, onPress, isSelected, height}) => {
    const handlePress = React.useCallback(
      () => onPress(country, countryCode, label),
      [country, countryCode, label],
    );
    return (
      <ListClicker style={listItemStyles.button} onPress={handlePress}>
        <Animated.View style={listItemStyles.container}>
          <Text style={listItemStyles.label}>{label}</Text>

          <Text style={listItemStyles.confirmedCount}>
            {Numeral(count).format('0,0')}
          </Text>
        </Animated.View>
      </ListClicker>
    );
  },
);

const SectionHeader = ({}) => (
  <View style={listItemStyles.sectionHeader}>
    <Text
      style={[
        listItemStyles.sectionHeaderLabel,
        listItemStyles.sectionHeaderLeft,
      ]}>
      Country/Region
    </Text>

    <Text
      style={[
        listItemStyles.sectionHeaderLabel,
        listItemStyles.sectionHeaderRight,
      ]}>
      Confirmed Cases
    </Text>
  </View>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    backgroundColor: 'black',
  },
  container: {
    width: '100%',

    flex: 1,
    position: 'relative',
  },
  list: Platform.select({
    web: {
      flex: 1,
      flexShrink: 0,
      width: '100%',
      overflow: 'visible',
    },
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
  }),
});

const CONTENT_INSET = {
  bottom: ROW_HEIGHT * 2,
  top: 0,
  left: 0,
  right: 0,
};

export const CountryFastList = ({
  countries,
  onPress,
  countryCode,
  height,
  isLoading = false,
}) => {
  const renderRow = React.useCallback(
    (section: number, row: number) => {
      const {country, countryCode, label, count} = countries[row];

      return (
        <CountryListItem
          country={country}
          key={countryCode}
          countryCode={countryCode}
          label={label}
          count={count}
          onPress={onPress}
        />
      );
    },
    [countries, onPress],
  );

  const renderHeader = React.useCallback(() => <SectionHeader />, [
    SectionHeader,
  ]);

  const sectionCounts = React.useMemo(() => [countries.length], [
    countries,
    countries.length,
  ]);

  const headerHeight = React.useCallback(
    (section: number) => (section === 0 ? ROW_HEIGHT : 0),
    [],
  );

  return (
    <View pointerEvents="box-none" height={height} style={styles.container}>
      <FastList
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="on-drag"
        // contentInset={contentInset}

        contentInset={CONTENT_INSET}
        // contentOffset={contentOffset}
        // insetBottom={Math.abs(contentInset.bottom) * -1}
        // insetTop={contentInset.top}
        // ref={fastListRef}
        // scrollTopValue={scrollY}
        scrollIndicatorInsets={SCROLL_INSETS}
        // renderHeader={this.props.renderHeader}
        automaticallyAdjustContentInsets={false}
        // waitFor={waitFor}
        // nativeViewRef={nativeViewRef}
        // simultaneousHandlers={simultaneousHandlers}
        keyboardShouldPersistTaps="always"
        isLoading={isLoading}
        renderRow={renderRow}
        // scrollY={scrollY}
        containerHeight={height}
        scrollToOverflowEnabled
        // scrollEnabled={scrollEnabled}
        overScrollMode="always"
        footerHeight={0}
        isFastList
        stickyHeaders={false}
        style={styles.list}
        // onScrollEnd={this.handleScrollEnd}
        isFastList
        // listKey={listKey}
        // renderEmpty={ListEmptyComponent}
        rowHeight={ROW_HEIGHT}
        headerHeight={SECTION_HEADER_HEIGHT}
        sections={sectionCounts}
        renderHeader={renderHeader}
      />
    </View>
  );
};

export const CountryPickerRoute = ({}) => {
  const {country, countryCode, setCountry} = React.useContext(CountryContext);
  const {goBack} = useNavigation();

  const {data: countriesData = [], error: countriesEror} = useSWR<
    Array<CountryEndpoint.CountryInfection>
  >(COUNTRIES_URL, apiFetcher);
  const {data: totalsData = [], error: totalsError} = useSWR<
    Array<TotalEndpoint.TotalInfection>
  >(TOTALS_URL, apiFetcher);

  const countries = React.useMemo(() => {
    const _countries = countriesData.map(country => {
      return {
        country: country.id,
        label: country.label,
        count: country.infections.confirm,
        countryCode: getCode(country.label),
      };
    });

    return [
      {
        country: 'World',
        countryCode: 'World',
        label: 'World',
        count: totalsData[0]?.infections?.confirm ?? 0,
      },
    ].concat(_countries);
  }, [countriesData, countriesData.length, getCode, totalsData]);

  const handleChangeCountry = React.useCallback(
    (country, countryCode) => {
      sendSelectionFeedback();
      setCountry(country, countryCode);
      goBack();
    },
    [setCountry, goBack],
  );

  return (
    <View style={styles.page}>
      <Header />

      <CountryFastList
        countries={countries}
        countryCode={countryCode}
        onPress={handleChangeCountry}
        height={SCREEN_HEIGHT - 64}
      />
    </View>
  );
};

export default CountryPickerRoute;
