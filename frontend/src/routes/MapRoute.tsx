import {useNavigation} from '@react-navigation/core';
import haversineDistance from 'haversine-distance';
import Numeral from 'numeral';
import * as React from 'react';
import {
  ActivityIndicator,
  BackHandler,
  findNodeHandle,
  Platform,
  StyleSheet,
  Text,
  unstable_batchedUpdates,
  View,
  StatusBar,
} from 'react-native';
import {Region} from 'react-native-maps';
import Share from 'react-native-share';
import {usePaginatedQuery} from 'react-query';
import useSWR from 'swr';
import {
  apiFetcher,
  buildShareURL,
  COUNTRIES_URL,
  fetchPins,
  fetchUserPins,
  TOTALS_URL,
  userReportByIdURL,
  USER_REPORT_STATS,
} from '../api';
import {
  ConfirmedPin,
  CountryEndpoint,
  SelfReportedResponse,
  TotalEndpoint,
  UserReportListRequest,
} from '../API_TYPES';
import {ConfirmedReportListItem} from '../components/ConfirmedReportListItem';
import {CONTENT_WIDTH} from '../components/CONTENT_WIDTH';
import CoordinatorLayout from '../components/CoordinatorLayout';
import {CountBox} from '../components/CountBox';
import {CountryContext} from '../components/CountryContext';
import {CountryPicker} from '../components/CountryPicker';
import {FeedSheet} from '../components/FeedSheet';
import {LocationButton} from '../components/LocationButton';
import {MapContext} from '../components/MapContext';
import {MapView} from '../components/MapView';
import {PullyView} from '../components/PullyView';
import {SCREEN_DIMENSIONS} from '../components/ScreenSize';
import {ShareButton} from '../components/ShareButton';
import {SickButton} from '../components/SickButton';
import {StatsButton} from '../components/StatsButton';
import {
  hasLocation,
  UserLocationContext,
} from '../components/UserLocationContext';
import {
  UNWRAPPED_USER_REPORT_HEIGHT,
  UserReportListItem,
} from '../components/UserReportListItem';
import {RNLocation} from '../lib/Location';
import {useSafeArea} from '../lib/SafeArea';
import {COLORS} from '../lib/theme';
import {sendSelectionFeedback} from '../lib/Vibration';
import {getMapBounds, geocode} from '../lib/Yeet';
import {RegionContext} from './RegionContext';
import {isPointInPolygon, getDistance, isPointWithinRadius} from 'geolib';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  sheet: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  sickButton: {
    position: 'absolute',
    right: 0,
  },
  countryPicker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  mapFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  header: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  headerLeft: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    top: 0,
    position: 'absolute',
    alignItems: 'center',
    left: 4,
  },
  headerMiddle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 8,
    flex: 1,
    top: 0,
  },
  headerRight: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    top: 0,
    position: 'absolute',
    alignItems: 'center',
    right: 4,
  },
});

const DEFAULT_INFECTIONS = {
  recover: 0,
  dead: 0,
  confirm: 0,
};

enum MapSelectionType {
  sheet = 'sheet',
  userReport = 'userReport',
  confirmedReport = 'confirmedReport',
}

export const MapRoute = ({}) => {
  const {setRegion, region} = React.useContext(RegionContext);
  const initialRegion = React.useRef(region);
  // const [region, setRegion] = React.useState(INITIAL_REGION);
  const [selectionType, setSelectionType] = React.useState<MapSelectionType>(
    MapSelectionType.sheet,
  );
  const [selectedId, setSelectedId] = React.useState(null);
  const {country, setCountry, countryCode} = React.useContext(CountryContext);
  const {navigate} = useNavigation();
  const {data: totalsData = [], error: totalsError, loadin} = useSWR<
    Array<TotalEndpoint.TotalInfection>
  >(TOTALS_URL, apiFetcher);
  const {data: countriesData = [], error: countriesEror} = useSWR<
    Array<CountryEndpoint.CountryInfection>
  >(COUNTRIES_URL, apiFetcher);
  const {data: sickCounts, error: sickError} = useSWR<SelfReportedResponse>(
    USER_REPORT_STATS,
    apiFetcher,
  );
  const location = React.useContext(UserLocationContext);
  const hasNavigatedToUserLocation = React.useRef(false);

  const {resolvedData: confirmedPins} = usePaginatedQuery(
    ['get_pins', region],
    fetchPins,
  );
  const {resolvedData: userPins} = usePaginatedQuery(
    ['get_user_pins', region],
    fetchUserPins,
  );

  const mapRef = React.useRef();
  const moveMap = React.useCallback(
    ({latitude, longitude, altitude = 1000 * 100}) => {
      if (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        latitude !== 0 &&
        longitude !== 0
      ) {
        mapRef?.current?.animateCamera({
          center: {latitude, longitude},
          altitude,
        });
      }
    },
    [mapRef],
  );

  const mapContextValue = React.useMemo(() => ({moveMap}), [moveMap]);

  const {top, bottom} = useSafeArea();

  const handleRegionChange = React.useCallback(
    (_region: Region) => {
      const bounds = getMapBounds(
        findNodeHandle(mapRef.current),
        mapRef.current,
        _region,
      );

      const region = {
        ..._region,
        minLongitude: bounds[0],
        minLatitude: bounds[1],
        maxLongitude: bounds[2],
        maxLatitude: bounds[3],
      };
      console.log('SET REGION', region);

      setRegion(region);
    },
    [setRegion, mapRef],
  );

  const [stats, setStats] = React.useState(
    totalsData[0]?.infections ?? DEFAULT_INFECTIONS,
  );

  React.useEffect(() => {
    if (country === 'World' && totalsData[0]) {
      setStats(totalsData[0].infections);
    } else if (countriesData && countriesData.length) {
      const row = countriesData.find(_row => {
        return _row.id === country;
      });

      if (row) {
        setStats(row.infections);
      }
    } else {
    }
  }, [country, totalsData, countriesData, setStats]);

  const lastCountryCode = React.useRef(countryCode);

  React.useEffect(() => {
    if (countryCode && countryCode !== lastCountryCode.current) {
      const row = countriesData.find(row => row.id === country);

      if ((row || countryCode === 'World') && mapRef.current) {
        const multipler = Platform.select({
          ios: 1,
          android: 1,
          web: 0.25,
        });

        let altitude = {
          cn: 1000 * 1000 * 10 * multipler,
          us: 1000 * 1000 * 10 * multipler,
          fr: 1000 * 1000 * 5 * multipler,
          ca: 1000 * 1000 * 10 * multipler,
          ru: 1000 * 1000 * 10 * multipler,
          jp: 1000 * 1000 * 5 * multipler,
          hk: (1000 * 1000) / (10 * multipler),
          gb: 1000 * 1000 * 2 * multipler,
          World: 1000 * 1000 * 100 * multipler,
        }[countryCode];

        if (!altitude) {
          altitude = 1000 * 1000 * 5;
        }

        let latitude = null;
        let longitude = null;
        if (row) {
          latitude = row.latitude;
          longitude = row.longitude;
        }

        mapRef.current.animateCamera({
          center: countryCode !== 'World' ? {latitude, longitude} : undefined,
          altitude,
        });
        lastCountryCode.current = countryCode;
        console.log('handle move');
      }
    }
  }, [countryCode, country, countriesData, mapRef]);

  React.useEffect(() => {
    if (
      location &&
      location.latitude &&
      location.longitude &&
      !hasNavigatedToUserLocation.current &&
      moveMap
    ) {
      const {latitude, longitude} = location;
      moveMap({latitude, longitude, altitude: 500000});
      hasNavigatedToUserLocation.current = true;
    }
  }, [location, hasNavigatedToUserLocation, moveMap]);

  const openReportSick = React.useCallback(() => {
    navigate('ReportSick');
  }, [navigate]);

  const openStats = React.useCallback(() => {
    navigate('Stats');
  }, [navigate]);

  const circles = React.useMemo(() => {
    return (
      confirmedPins?.pins.map((pin, index) => ({
        latitude: pin.latitude,
        longitude: pin.longitude,
        object: 'infection',
        faded: pin.infections.confirm - pin.infections.recover <= 0,
        color: COLORS.confirmed,
        id: String(pin.id),
        pin: pin,
      })) ?? []
    );
  }, [confirmedPins]);

  const pins = React.useMemo(() => {
    return (
      userPins?.pins.map((pin, index) => ({
        latitude: pin.latitude,
        longitude: pin.longitude,
        id: String(pin.id),
        infections: pin.infections,
        object: 'user_report',
        color: COLORS.selfReported,
      })) ?? []
    );
  }, [userPins]);

  const selectedObject = React.useMemo(() => {
    if (selectionType === MapSelectionType.sheet) {
      return null;
    } else if (selectionType === MapSelectionType.confirmedReport) {
      return circles.find(pin => String(pin.id) === String(selectedId))?.pin;
    } else if (selectionType === MapSelectionType.userReport) {
      return pins.find(pin => String(pin.id) === selectedId);
    }
  }, [circles, pins, selectionType, selectedId]);

  const allPins = React.useMemo<Array<ConfirmedPin>>(() => {
    return [].concat(pins).concat(circles);
  }, [pins, circles]);

  const handlePressPin = React.useCallback(
    pin => {
      console.log('PRESS PIN!', pin);
      if (pin.object === 'user_report') {
        setSelectionType(MapSelectionType.userReport);
        setSelectedId(pin.id);
        sendSelectionFeedback();
      } else if (pin.object === 'infection') {
        setSelectionType(MapSelectionType.confirmedReport);
        setSelectedId(pin.id);

        sendSelectionFeedback();
      }
    },
    [allPins, setSelectedId, setSelectionType],
  );
  const handlePressMap = React.useCallback(
    map => {
      console.log('PRESS MAP!');
      unstable_batchedUpdates(() => {
        setSelectedId(null);
        setSelectionType(selectionType => {
          if (selectionType !== MapSelectionType.sheet) {
            sendSelectionFeedback();
          }

          return MapSelectionType.sheet;
        });
      });
    },
    [setSelectedId, setSelectionType],
  );

  const handlePressLocation = React.useCallback(async () => {
    const {
      canRequestLocationAccess,
      setCanRequestLocationAccess,
      latitude,
      longitude,
      setLocation,
      locationPermissionStatus,
    } = location;

    if (latitude && longitude) {
      moveMap({latitude, longitude, altitude: 10000});
      return;
    }

    hasNavigatedToUserLocation.current = true;

    if (
      Platform.OS === 'android' &&
      locationPermissionStatus === 'notDetermined'
    ) {
      await RNLocation.requestPermission({
        ios: 'whenInUse', // or 'always'
        android: {
          detail: 'fine', // or 'fine'
          rationale: {
            title: 'We need to access your location',
            message: 'We use your location to show where you are on the map',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        },
      });
    }

    setCanRequestLocationAccess(true);

    RNLocation.getLatestLocation().then(
      location => {
        setLocation.current(location);
        const {latitude, longitude} = location;
        moveMap({latitude, longitude, altitude: 10000});
      },
      err => console.error(err),
    );
  }, [location, moveMap, hasNavigatedToUserLocation, RNLocation]);

  const confirmedCasesInRegion = React.useMemo(() => {
    let count = 0;
    if (!region) {
      return 0;
    }

    if (confirmedPins?.pins?.length) {
      const {minLatitude, minLongitude, maxLongitude, maxLatitude} = region;

      const polygon = [
        {
          latitude: minLatitude,
          longitude: minLongitude,
        },
        {
          latitude: minLatitude,
          longitude: maxLongitude,
        },
        {
          latitude: maxLatitude,
          longitude: maxLongitude,
        },
        {
          latitude: maxLatitude,
          longitude: minLongitude,
        },
      ];

      // const radius = getDistance(polygon[0], center) * 1.75;

      for (const pin of confirmedPins.pins) {
        if (
          isPointInPolygon(pin, polygon)
          // isPointWithinRadius(
          //   {latitude: pin.latitude, longitude: pin.longitude},
          //   center,
          //   radius,
          // )
        ) {
          count = count + pin.infections.confirm;
          count -= pin.infections.recover;
        }
      }
    }

    return count;
  }, [userPins, confirmedPins, region]);

  const onPressShare = React.useCallback(async () => {
    const {altitude} = region;
    const results = await geocode(region.latitude, region.longitude);
    let cityName = null;

    const {city, sub_admin_area, feature_name, state, address} =
      results[0] ?? {};

    if (altitude < 10000) {
      cityName = results[0]?.city;
    }

    if (altitude < 1000000 && !cityName) {
      cityName = results[0]?.sub_admin_area ?? results[0]?.feature_name;
    } else if (!cityName) {
      cityName = address;
    }

    return Share.open({
      message: `There are ${Numeral(confirmedCasesInRegion).format(
        '0,0',
      )}+ cases of Corona virus${
        cityName ? ' near ' + cityName : ''
      }.\n\n${buildShareURL(region)}`,
    });
  }, [region, buildShareURL, confirmedCasesInRegion]);

  return (
    <MapContext.Provider value={mapContextValue}>
      <CoordinatorLayout
        style={styles.container}
        sheet={
          selectionType === MapSelectionType.sheet && (
            <PullyView initialStickyPointOffset={350} animateOpen={false}>
              <FeedSheet />
            </PullyView>
          )
        }>
        <MapView
          initialRegion={initialRegion.current}
          region={region}
          onRegionChange={handleRegionChange}
          onPressPin={handlePressPin}
          selectedId={selectedId}
          onPressMap={handlePressMap}
          userLocation={location}
          ref={mapRef}
          height={SCREEN_DIMENSIONS.height - 348}
          pins={allPins}>
          <View pointerEvents="box-none" style={[styles.header, {top}]}>
            <StatusBar backgroundColor={COLORS.dark} />
            <View pointerEvents="box-none" style={styles.headerLeft}>
              <StatsButton onPress={openStats} />
              <LocationButton onPress={handlePressLocation} />
            </View>
            <View pointerEvents="box-none" style={styles.headerMiddle}>
              <CountryPicker />
            </View>
            <View pointerEvents="box-none" style={styles.headerRight}>
              <SickButton onPress={openReportSick} />
              <ShareButton onPress={onPressShare} />
            </View>
          </View>

          <View
            pointerEvents="box-none"
            style={[
              styles.mapFooter,
              {bottom: 320, paddingBottom: 50, paddingTop: 0},
            ]}>
            <CountBox
              feelingSick={sickCounts?.interval?.year[countryCode]}
              infected={confirmedCasesInRegion}
            />
          </View>
        </MapView>

        <MapOverlay
          type={selectionType}
          id={selectedId}
          object={selectedObject}
          deselect={handlePressMap}
        />
      </CoordinatorLayout>
    </MapContext.Provider>
  );
};

const UserReportCard = ({id}) => {
  const location = React.useContext(UserLocationContext);
  const {data: userReport, error} = useSWR<UserReportListRequest.ShowResponse>(
    userReportByIdURL(id),
    apiFetcher,
  );
  const {bottom} = useSafeArea();

  let content = null;

  if (userReport && userReport.data) {
    const distance = hasLocation(location)
      ? haversineDistance(location, {
          latitude: userReport.data.latitude,
          longitude: userReport.data.longitude,
        })
      : 0;
    content = (
      <View
        style={{
          height: UNWRAPPED_USER_REPORT_HEIGHT,
          width: CONTENT_WIDTH,
          shadowRadius: 5,
          alignSelf: 'center',
          shadowOpacity: 0.25,
          shadowColor: 'black',
          shadowOffset: {width: 1, height: 1},
        }}>
        <UserReportListItem
          wrap={false}
          report={userReport.data}
          distance={distance}
        />
      </View>
    );
  } else if (!userReport && !error) {
    content = <ActivityIndicator size="small" color="gray" />;
  } else if (error) {
    content = <Text style={{color: '#ccc'}}>It couldn't load. Try again!</Text>;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,

        paddingBottom: bottom,
        right: 0,
        height: 350,

        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      }}>
      {content}
    </View>
  );
};

let animateOpeningPullView = false;
export const MapOverlay = ({type, id, onPressSheetItem, object, deselect}) => {
  React.useEffect(() => {
    animateOpeningPullView = true;
  }, []);

  React.useEffect(() => {
    const eventHandler = () => {
      deselect && deselect();
      return !!deselect;
    };
    if (
      type === MapSelectionType.confirmedReport ||
      type === MapSelectionType.userReport
    ) {
      BackHandler.addEventListener('hardwareBackPress', eventHandler);
    }

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', eventHandler);
    };
  }, [type, deselect]);

  if (type === MapSelectionType.confirmedReport) {
    return <ConfirmedReportCard report={object} />;
  } else if (type === MapSelectionType.userReport) {
    return <UserReportCard id={id} />;
  } else {
    return null;
  }
};

const ConfirmedReportCard = ({report}) => {
  const {bottom} = useSafeArea();
  const location = React.useContext(UserLocationContext);

  let content = null;
  const distance = hasLocation(location)
    ? haversineDistance(location, report)
    : 0;

  content = (
    <View
      style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
      <View
        style={{
          height: UNWRAPPED_USER_REPORT_HEIGHT,
          width: CONTENT_WIDTH,
          shadowRadius: 5,
          shadowOpacity: 0.25,
          alignSelf: 'center',
          shadowColor: 'black',
          shadowOffset: {width: 1, height: 1},
        }}>
        <ConfirmedReportListItem
          wrap={false}
          report={report}
          distance={distance}
        />
      </View>
    </View>
  );

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,

        paddingBottom: bottom,
        right: 0,
        height: 350,

        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      }}>
      {content}
    </View>
  );
};
