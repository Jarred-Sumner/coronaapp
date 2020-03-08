import {useNavigation} from '@react-navigation/core';
import * as React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {BorderlessButton} from 'react-native-gesture-handler';
import {ScrollView} from '../components/ScrollView';
import Animated from 'react-native-reanimated';
import {useSafeArea} from '../lib/SafeArea';
import {CLOSE_BUTTON_SOURCE} from '../components/BitmapIcons';
import useSWR from 'swr';
import {apiFetcher, COUNTRIES_URL, TOTALS_URL, USER_REPORT_STATS} from '../api';
import {
  CountryEndpoint,
  TotalEndpoint,
  SelfReportedResponse,
} from '../API_TYPES';
import {CountryContext} from '../components/CountryContext';
import {CountryPicker} from '../components/CountryPicker';
import Numeral from 'numeral';
import {Timestamp} from '../components/Timestamp';
import {CloseButtonImage} from '../components/CloseButtonImage';

const SELECTED_COLOR = '#0091FF';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    position: 'relative',
    height: 76,
    width: '100%',
    overflow: 'visible',
    flex: 0,
    flexDirection: 'row',
    paddingVertical: 20,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  scrollViewStyle: {
    height: '100%',
  },
  scrollWrap: {
    flex: 1,
  },
  headerLabel: {
    flex: 1,
  },

  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  listContainer: {},
  listSection: {
    paddingVertical: 12,
    marginBottom: 32,
  },
  listSectionTitle: {
    fontSize: 16,
    color: 'white',
    paddingHorizontal: 16,
    marginBottom: 8,
    fontWeight: '700',
  },
  listSectionTitleSpacer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(42,42,42)',
    paddingBottom: 8,
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
    <View style={[styles.header, {paddingTop: 16}]}>
      <CountryPicker />
      <View style={styles.closeButton}>
        <BorderlessButton onPress={goBack}>
          <Animated.View style={styles.closeButtonView}>
            <CloseButtonImage />
          </Animated.View>
        </BorderlessButton>
      </View>
    </View>
  );
};

const statStyles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '500',
    marginRight: 8,
  },
  headerSource: {
    marginRight: 4,
    color: 'rgb(50,50,50)',
    fontSize: 12,
  },
  valueRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  valueLeft: {
    flex: 1,
    flexDirection: 'row',
  },
  valueNumber: {
    fontSize: 48,
    color: 'white',

    textAlign: 'center',
  },
  valueRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deltaDirection: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deltaPercent: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deltaPercentLabel: {
    flex: 0,
    alignItems: 'center',
    color: '#ccc',

    flexDirection: 'row',
  },
  deltaValue: {
    flex: 0,
    alignItems: 'center',
  },
  deltaUnitLabel: {
    color: 'white',
    flexDirection: 'row',
  },
  deltaSpacer: {
    width: 4,
    height: 1,
  },
});
const StatRow = ({
  label,
  value,
  source,
  updatedAt,
  deltaPercentage = 0,
  deltaUnit = 'week',
}) => {
  const number =
    typeof value === 'number' ? Numeral(value).format('0,0') : value;
  return (
    <View style={statStyles.container}>
      <View style={statStyles.header}>
        <Text style={statStyles.headerLabel}>{label}</Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          lineBreakMode="tail"
          style={statStyles.headerSource}>
          {updatedAt && (
            <>
              <Timestamp time={updatedAt} />
              {' ago '}
            </>
          )}
          via {source}
        </Text>
      </View>

      <View style={statStyles.valueRow}>
        <View style={statStyles.valueLeft}>
          <Text style={statStyles.valueNumber}>{number}</Text>
        </View>

        <View style={statStyles.valueRight}>
          {/* <View style={statStyles.deltaValue}></View>
          <View style={statStyles.deltaValue}>
            <Text style={statStyles.deltaPercentLabel}>
              {Math.round(deltaPercentage * 100.0)}%
            </Text>
          </View>
          <View style={statStyles.deltaSpacer} />
          <Text style={statStyles.deltaUnitLabel}>in last {deltaUnit}</Text> */}
        </View>
      </View>
    </View>
  );
};

export const StatsRoute = ({}) => {
  const {countryCode, country} = React.useContext(CountryContext);
  const [interval, setInterval] = React.useState('week');

  const {data: totalsData = [], error: totalsError} = useSWR<
    Array<TotalEndpoint.TotalInfection>
  >(TOTALS_URL, apiFetcher);
  const {data: countriesData = [], error: countriesEror} = useSWR<
    Array<CountryEndpoint.CountryInfection>
  >(COUNTRIES_URL, apiFetcher);
  const {data: sickCounts, error: sickError} = useSWR<SelfReportedResponse>(
    USER_REPORT_STATS,
    apiFetcher,
  );

  const [stats, setStats] = React.useState(() => {
    if (totalsData.length > 0 && countryCode === 'World') {
      return totalsData[0].infections;
    } else {
      const row = countriesData.find(_row => {
        return _row.id === countryCode;
      });

      if (row) {
        return row.infections;
      } else {
        return {
          recover: 0,
          dead: 0,
          confirm: 0,
        };
      }
    }
  });

  React.useEffect(() => {
    if (country === 'World' && totalsData[0]) {
      setStats(totalsData[0].infections);
    } else {
      const row = countriesData.find(_row => {
        return _row.id === country;
      });

      if (row) {
        setStats(row.infections);
      }
    }
  }, [country, totalsData, countriesData, setStats]);

  const {bottom} = useSafeArea();

  return (
    <View style={styles.screen}>
      <Header />

      <View style={styles.scrollWrap}>
        <ScrollView style={styles.scrollViewStyle}>
          <StatRow
            label="Confirmed Cases"
            value={stats.confirm}
            source="John Hopkins CSSE"
          />
          <StatRow
            label="Self-reported"
            value={sickCounts?.interval[interval][countryCode] || '-'}
            updatedAt={sickCounts?.last_updated}
            deltaPercentage={sickCounts?.delta[interval][countryCode]}
            source="Covy"
          />

          <StatRow
            label="Deaths"
            value={stats.dead || 0}
            source="John Hopkins CSSE"
          />

          <StatRow
            label="Recovered"
            value={stats.recover}
            source="John Hopkins CSSE"
          />
        </ScrollView>
      </View>
    </View>
  );
};
export default StatsRoute;
