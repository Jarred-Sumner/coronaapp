import {useNavigation} from '../components/useNavigation';
import * as React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Alert from '../lib/Alert';
import {getUniqueId} from 'react-native-device-info';
import {
  BorderlessButton,
  RectButton,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import publicIP from 'react-native-public-ip';
import Animated from 'react-native-reanimated';
import {useSafeArea} from 'react-native-safe-area-context';
import {createUserReport} from '../api';
import {
  BitmapIcon,
  CHECK,
  CLOSE_BUTTON_SOURCE,
} from '../components/BitmapIcons';
import {ScrollView} from '../components/ScrollView';
import Location from '../lib/Location';
import {openLink} from '../lib/openLink';
import {sendLightFeedback} from '../lib/Vibration';
import {CloseButtonImage} from '../components/CloseButtonImage';
import {UserLocationContext} from '../components/UserLocationContext';

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
    height: 64,
    width: '100%',
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
  submitButtonContainer: {
    position: 'absolute',
    left: 0,
    marginHorizontal: 32,
    right: 0,
    bottom: 16,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    flex: 1,
    overflow: 'hidden',
    backgroundColor: SELECTED_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonLabel: {
    flex: 1,
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  learnMoreFooter: {
    paddingHorizontal: 16,
    width: '100%',
    overflow: 'visible',
  },
  learnMore: {
    fontWeight: '500',
    color: '#ccc',
    textDecorationColor: 'rgba(100,100,100,0.55)',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
});

const listItemStyles = StyleSheet.create({
  wrapper: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    position: 'relative',
    borderBottomColor: 'rgb(42,42,42)',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    color: 'white',
    flex: 1,
  },
  selectedTitle: {
    fontSize: 18,
    color: SELECTED_COLOR,
    flex: 1,
  },
  checkboxContainer: {
    position: 'absolute',
    top: 0,

    bottom: 0,
    right: 16,
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 16,
  },
});

const ListItem = ({label, isSelected, value, onPress}) => {
  const _onPress = React.useCallback(() => {
    onPress(value);
  }, [onPress, value]);

  return (
    <TouchableHighlight onPress={_onPress}>
      <Animated.View style={listItemStyles.wrapper}>
        <Text
          style={
            isSelected ? listItemStyles.selectedTitle : listItemStyles.title
          }>
          {label}
        </Text>
        <View style={listItemStyles.checkboxContainer}>
          <BitmapIcon
            source={CHECK}
            style={[listItemStyles.checkbox, {opacity: isSelected ? 1 : 0}]}
          />
        </View>
      </Animated.View>
    </TouchableHighlight>
  );
};

const Header = () => {
  const {goBack} = useNavigation();

  return (
    <View style={[styles.header, {paddingTop: 16}]}>
      <View style={styles.headerLabel}>
        <Text style={styles.title}>😷 Feeling sick?</Text>
      </View>
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

const QUESTIONS = {
  symptoms: [
    {label: 'Fever', value: 'fever'},
    {label: 'Shortness of breath', value: 'short of breadth'},
    {label: 'Cough', value: 'cough'},
  ],
  traveled_recently: [
    {label: 'Yes', value: 'true'},
    {label: 'No', value: 'false'},
  ],
};

export const ReportSickRoute = ({}) => {
  const [symptoms, setSymptoms] = React.useState([]);
  const [traveledRecently, setTraveledRecently] = React.useState('');
  const {bottom} = useSafeArea();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const {goBack} = useNavigation();

  const openCDCLink = React.useCallback(() => {
    openLink('https://www.cdc.gov/coronavirus/2019-ncov/about/symptoms.html');
  }, [openLink]);

  const toggleSymptom = React.useCallback(
    (value: string) => {
      setSymptoms(symptoms => {
        const _symptoms = [...symptoms];

        if (symptoms.includes(value)) {
          _symptoms.splice(symptoms.indexOf(value), 1);

          return _symptoms;
        } else {
          _symptoms.push(value);
          return _symptoms;
        }
      });
    },
    [setSymptoms],
  );

  const renderSymptom = React.useCallback(
    ({label, value}, index) => {
      const isSelected = symptoms.includes(value);

      return (
        <ListItem
          label={label}
          key={`${value}-${isSelected}`}
          value={value}
          isSelected={isSelected}
          onPress={toggleSymptom}
        />
      );
    },
    [symptoms, toggleSymptom],
  );

  const toggleTraveledRecently = React.useCallback(
    (_value: string) => {
      setTraveledRecently(value => {
        if (value === _value) {
          return 'false';
        } else {
          return 'true';
        }
      });
    },
    [setTraveledRecently],
  );

  const renderTraveledRecently = React.useCallback(
    ({label, value}) => {
      const isSelected = traveledRecently === value;

      return (
        <ListItem
          label={label}
          key={`${value}-${traveledRecently}`}
          value={value}
          isSelected={isSelected}
          onPress={setTraveledRecently}
        />
      );
    },
    [traveledRecently, toggleTraveledRecently],
  );

  const location = React.useContext(UserLocationContext);

  const onSubmit = React.useCallback(async () => {
    if (symptoms.length === 0) {
      Alert.alert('If you have any symptoms, please list them.');
      return;
    }

    const deviceUid = getUniqueId();
    setSubmitting(true);

    const ipAddress = await publicIP();
    let latitude = location.latitude;
    let longitude = location.longitude;
    let locationAccuracy = location.locationAccuracy;

    if (!latitude || !longitude) {
      const hasLocationPermission = await Location.requestPermission({
        ios: 'whenInUse',
        android: {
          detail: 'coarse',
        },
      });

      if (hasLocationPermission) {
        try {
          const location = await Location.getLatestLocation({timeout: 10000});
          if (location) {
            latitude = location.latitude;
            longitude = location.longitude;
            locationAccuracy = location.accuracy;
          }
        } catch (exception) {
          console.warn('Continuing without location');
        }
      }
    }

    try {
      const report = await createUserReport({
        ipAddress,
        deviceUid,
        latitude,
        longitude,
        locationAccuracy,
        symptoms,
        traveledRecently,
      });

      if (report) {
        Alert.alert('Submitted.');
        sendLightFeedback();
        goBack();
      } else {
        setSubmitting(false);
        Alert.alert('Something went wrong', 'Please try again');
      }
    } catch (exception) {
      setSubmitting(false);
      Alert.alert('Something went wrong', 'Please try again');
      console.error(exception);
    }
  }, [
    getUniqueId,
    symptoms,
    setSubmitting,
    traveledRecently,
    createUserReport,
    location,
    publicIP,
    Location.getLatestLocation,
    Location.requestPermission,
    goBack,
  ]);

  return (
    <View style={styles.screen}>
      <Header />

      <View style={styles.scrollWrap}>
        <ScrollView
          contentInset={{bottom: 100, top: 0, left: 0, right: 0}}
          style={styles.scrollViewStyle}>
          <View style={styles.listSection}>
            <Text style={styles.listSectionTitle}>
              What symptoms do you have?
            </Text>
            <View style={styles.listSectionTitleSpacer} />
            {QUESTIONS.symptoms.map(renderSymptom)}
          </View>

          <View style={styles.listSection}>
            <Text style={styles.listSectionTitle}>
              Have you traveled recently?
            </Text>
            <View style={styles.listSectionTitleSpacer} />
            {QUESTIONS.traveled_recently.map(renderTraveledRecently)}
          </View>

          <BorderlessButton
            style={styles.learnMoreFooter}
            onPress={openCDCLink}>
            <Animated.View>
              <Text style={styles.learnMore}>
                Learn more about COVID-19 from the CDC
              </Text>
            </Animated.View>
          </BorderlessButton>
        </ScrollView>

        <RectButton
          onPress={onSubmit}
          enabled={!isSubmitting}
          style={[styles.submitButtonContainer, {bottom: bottom || 16}]}>
          <Animated.View style={styles.submitButton}>
            <Text adjustsFontSizeToFit style={styles.submitButtonLabel}>
              Submit
            </Text>
          </Animated.View>
        </RectButton>
      </View>
    </View>
  );
};
export default ReportSickRoute;
