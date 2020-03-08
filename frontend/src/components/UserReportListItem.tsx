import {capitalize} from 'lodash';
import Numeral from 'numeral';
import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BaseButton} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import {UserReportListRequest} from '../API_TYPES';
import {COLORS} from '../lib/theme';
import {CONTENT_WIDTH} from './CONTENT_WIDTH';
import {Timestamp} from './Timestamp';
import {ListClicker} from './ListClicker';
import {formatDistance} from '../lib/formatDistance';

export const USER_REPORT_HEIGHT = 148;
export const UNWRAPPED_USER_REPORT_HEIGHT = USER_REPORT_HEIGHT - 16;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#353535',
    width: CONTENT_WIDTH,
    height: UNWRAPPED_USER_REPORT_HEIGHT,

    borderRadius: 4,
  },
  wrapper: {
    width: CONTENT_WIDTH,
    height: USER_REPORT_HEIGHT,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    width: CONTENT_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    flex: 1,
  },
  titleLabel: {
    flexGrow: 1,
    fontSize: 16,
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
    backgroundColor: COLORS.selfReported,
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

export const UserReportListItem = React.memo(
  ({
    report,
    distance = 0,
    wrap = true,
    onPress,
  }: {
    report: UserReportListRequest.UserReport;
    distance: number;
    onPress: (report: UserReportListRequest.UserReport) => void;
  }) => {
    const handlePressReport = React.useCallback(() => {
      onPress && onPress(report);
    }, [onPress, report]);

    const content = (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.colorDot} />
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={styles.titleLabel}>
            Someone is feeling sick in {report.location?.city},{' '}
            {report.location?.state}
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

          <Timestamp
            time={report.created_at}
            style={styles.timestamp}></Timestamp>
        </View>

        <View style={styles.body}>
          <Text numberOfLines={3} style={styles.bodyText}>
            Symptoms include: {formatSymptoms(report.symptoms)}
            {'\n'}
            Recently traveled: {report.traveled_recently ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    );

    if (wrap) {
      return (
        <ListClicker onPress={handlePressReport}>
          <Animated.View style={styles.wrapper}>{content}</Animated.View>
        </ListClicker>
      );
    } else {
      return content;
    }
  },
);
