import {capitalize} from 'lodash';
import Numeral from 'numeral';
import {formatDistance} from '../lib/formatDistance';
import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BaseButton} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {ConfirmedPin} from '../API_TYPES';
import {COLORS} from '../lib/theme';
import {CONTENT_WIDTH} from './CONTENT_WIDTH';
import {Timestamp} from './Timestamp';
import {ListClicker} from './ListClicker';

export const CONFIRMED_REPORT_HEIGHT = 164;
export const UNWRAPPED_USER_REPORT_HEIGHT = CONFIRMED_REPORT_HEIGHT - 16;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#353535',

    height: UNWRAPPED_USER_REPORT_HEIGHT,

    borderRadius: 4,
  },
  wrapper: {
    height: CONFIRMED_REPORT_HEIGHT,
    alignSelf: 'stretch',
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    flex: 1,
  },
  titleLabel: {
    flexGrow: 1,
    fontSize: 18,
    marginLeft: 8,
    color: 'white',
    fontWeight: '600',
  },
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    // flex: 1,
  },
  distanceLabel: {
    fontSize: 16,
    color: 'rgb(98,98,98)',
  },
  circleSpacer: {
    width: 4,
    marginLeft: 4,
    marginRight: 4,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#666',
  },
  timestamp: {
    color: 'rgb(98,98,98)',
    fontSize: 16,
  },
  bodyText: {
    color: 'white',
    lineHeight: 24,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    // flex: 1,
  },
  colorDot: {
    backgroundColor: COLORS.confirmed,
    width: 8,
    height: 8,
    borderRadius: 4,

    flexBasis: 8,
    flexShrink: 0,
  },
});

enum Symptom {
  headache = 'headache',
  fever = 'fever',
  nausea = 'nausea',
}

const SYMPTOM_LABELS = {
  [Symptom.headache]: 'Headache',
  [Symptom.fever]: 'Fever',
  [Symptom.nausea]: 'Nausea',
};

const formatSymptoms = (symptoms: Array<string>) => {
  return symptoms
    .map(symptom => capitalize(symptom.trim().toLowerCase()))
    .join(' , ');
};

const ConfirmedReportComponent = React.memo(
  ({
    label,
    infections: {confirm, recover, dead},
    distance = 0,
    last_updated,
  }) => {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.colorDot} />
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={styles.titleLabel}>
            {label}
          </Text>
        </View>

        <View style={styles.subtitle}>
          {distance > 0 && (
            <>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.distanceLabel}>
                {formatDistance(distance, 'mi')}
              </Text>
              <View style={styles.circleSpacer} />
            </>
          )}

          <Timestamp time={last_updated} style={styles.timestamp}></Timestamp>
          <View style={styles.circleSpacer} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.distanceLabel}>
            via John Hopkins CSSE
          </Text>
        </View>

        <View style={styles.body}>
          <Text numberOfLines={6} style={styles.bodyText}>
            Confirmed cases: {Numeral(confirm).format('0,0')}
            {'\n'}
            Recovered: {Numeral(recover).format('0,0')}
            {'\n'}
            Deaths: {Numeral(dead).format('0,0')}
          </Text>
        </View>
      </View>
    );
  },
);

export const ConfirmedReportListItem = ({
  report,
  wrap = true,
  distance = 0,
  onPress,
}: {
  report: ConfirmedPin;

  distance: number;
  onPress: (report: ConfirmedPin) => void;
}) => {
  const handlePressReport = React.useCallback(() => {
    onPress && onPress(report);
  }, [onPress, report]);

  if (wrap) {
    return (
      <ListClicker onPress={handlePressReport}>
        <Animated.View style={styles.wrapper}>
          <ConfirmedReportComponent
            label={report.label}
            infections={report.infections}
            last_updated={report.last_updated}
            distance={distance}
          />
        </Animated.View>
      </ListClicker>
    );
  } else {
    return (
      <ConfirmedReportComponent
        label={report.label}
        infections={report.infections}
        last_updated={report.last_updated}
        distance={distance}
      />
    );
  }
};
