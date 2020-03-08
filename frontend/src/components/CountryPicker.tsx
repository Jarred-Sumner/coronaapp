import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Image,
  Platform,
} from 'react-native';
import {useSafeArea} from '../lib/SafeArea';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {CountryEndpoint} from '../API_TYPES';
import countryFlagEmoji from 'country-flag-emoji';
import {useNavigation} from '@react-navigation/core';
import {CountryContext} from './CountryContext';
import {CHEVRON_DOWN, BitmapIcon} from './BitmapIcons';

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  container: {
    paddingHorizontal: 12,
    paddingRight: 32,
    position: 'relative',
    // maxWidth: 200,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowRadius: 1,
    shadowColor: 'black',
    shadowOpacity: 0.25,
    flexDirection: 'row',
    borderRadius: 100,
    alignItems: 'center',
    flex: -1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingVertical: 8,
  },
  flag: {
    fontSize: 18,
    flex: -1,
    marginRight: 6,
    paddingLeft: 26,
    marginLeft: -26,
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  country: {
    fontSize: 18,
    flex: -1,
    fontWeight: '600',
    color: 'white',
  },
});

const findCountryEmoji = (country: string) => {
  if (country === 'World') {
    return '🌏';
  } else if (country === 'Hong Kong') {
    return '🇭🇰';
  } else if (countryFlagEmoji.get(country)) {
    return countryFlagEmoji.get(country).emoji;
  } else {
    return Object.values(countryFlagEmoji.data).find(
      emoji => emoji.name.toLowerCase().trim() === country.toLowerCase().trim(),
    )?.emoji;
  }
};

console.log({CHEVRON_DOWN});

export const CountryPicker = ({}: {}) => {
  const {country, countryCode, label} = React.useContext(CountryContext);
  const {navigate} = useNavigation();
  const handleSelectCountry = React.useCallback(
    () => navigate('CountryPicker'),
    [navigate],
  );

  const emoji = React.useMemo(() => {
    return findCountryEmoji(countryCode);
  }, [countryCode, findCountryEmoji]);

  return (
    <TouchableWithoutFeedback
      style={{overflow: 'visible'}}
      onPress={handleSelectCountry}>
      <View style={styles.container}>
        <Text style={styles.flag}>{emoji}</Text>
        <Text style={styles.country}>{label}</Text>
        <View style={styles.iconContainer}>
          <BitmapIcon
            source={CHEVRON_DOWN}
            style={{
              width: 12,
              height: 8,
            }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
