import * as React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {usePaginatedQuery} from 'react-query';
import {RegionContext} from '../routes/RegionContext';
import {apiFetcher, fetchGraphStats} from '../api';
import Numeral from 'numeral';
import {get, isFinite} from 'lodash';
import {COLORS} from '../lib/theme';

const white = 'rgb(201, 209, 218)';

const styles = StyleSheet.create({
  countBox: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexBasis: '50%',
    flexShrink: 1,
    backgroundColor: COLORS.darkMedium,
    borderRadius: 4,
  },
  countBoxSpacer: {
    width: 12,
    flexShrink: 0,
    height: 1,
  },
  coverageRow: {
    flex: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  coverageLabel: {
    color: white,
    opacity: 0.75,
    fontSize: 14,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: white,
  },
  label: {
    color: white,
    fontSize: 16,
    textAlign: 'center',
  },
  countRow: {
    padding: 12,
    paddingBottom: 0,
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'row',
  },
  container: {
    overflow: 'scroll-y',
  },
  content: {},
});

const CountBoxComponent = ({value, label}) => {
  const number = isFinite(value) ? Numeral(value).format('0,0') : '–';

  return (
    <View style={styles.countBox}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.value}>
        {number}
      </Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>
        {label}
      </Text>
    </View>
  );
};

const fillData = data => {
  const keys;
};

const StatsListComponent = ({
  totals,
  width,
  unitedStates = false,
  counties,
}) => {
  const ongoing = get(totals, 'ongoing');
  const recovered = get(totals, 'recover');
  const dead = get(totals, 'dead');
  const cumulative = get(totals, 'cumulative');

  const coverage = React.useMemo(() => {
    if (!unitedStates || !counties || Object.keys(counties).length === 0) {
      return null;
    }

    const countyList = Object.values(counties);

    if (countyList.length === 1) {
      return `${countyList[0].county.name} County`;
    } else if (countyList.length === 2) {
      return `${countyList[0].county.name} County & ${countyList[1].county.name} County`;
    } else if (countyList.length > 2) {
      return `Counties: ${countyList
        .map(county => county.county.name)
        .join(', ')}`;
    } else {
      return null;
    }
  }, [counties, unitedStates]);

  return (
    <View style={[styles.container, {width}]}>
      <View style={[styles.content, {width}]}>
        <View style={styles.countRow}>
          <CountBoxComponent value={ongoing} label="Ongoing cases" />
          <View style={styles.countBoxSpacer} />
          <CountBoxComponent value={recovered} label="Recovered" />
        </View>

        <View style={styles.countRow}>
          <CountBoxComponent value={dead} label="Deaths" />
          <View style={styles.countBoxSpacer} />
          <CountBoxComponent value={cumulative} label="Total cases" />
        </View>

        <View style={styles.coverageRow}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.coverageLabel}>
            {coverage}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const StatsList = ({
  nativeViewRef,
  scrollEnabled,
  scrollY,
  listRef,
  horizontal,
  height,

  headerHeight,
  width,
  insetHeight,
  translateY,
}) => {
  const {region} = React.useContext(RegionContext);

  const {resolvedData: stats} = usePaginatedQuery(
    ['graph_stats', region],
    fetchGraphStats,
  );

  return (
    <StatsListComponent
      counties={stats?.counties}
      width={width}
      unitedStates={stats?.us == true}
      totals={stats?.totals}></StatsListComponent>
  );
};
