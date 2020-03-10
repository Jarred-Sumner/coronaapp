import {merge} from 'lodash';
import {Platform} from 'react-native';
import qs from 'qs';
import {Region} from 'react-native-maps';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const hostname = Platform.select({
  ios: IS_PRODUCTION ? 'https://covy.app' : 'http://localhost:3000',
  android: IS_PRODUCTION ? 'https://covy.app' : 'http://localhost:3000',
  web: IS_PRODUCTION ? '' : 'http://localhost:3000',
});

export const TOTALS_URL = `${hostname}/api/stats/totals`;
export const COUNTRIES_URL = `${hostname}/api/stats/country`;
export const USER_REPORT_STATS = `${hostname}/api/stats/user_reports`;
export const CREATE_USER_REPORT_URL = `${hostname}/api/user_reports`;
export const GET_USER_REPORTS_URL = `${hostname}/api/user_reports`;
export const REPORTS_LIST_URL = `${hostname}/api/user_reports/list`;
export const GET_PINS_URL = `${hostname}/api/reports`;
export const TWEETS_URL = `${hostname}/api/tweets`;

let HEADERS = {'Content-Type': 'application/json'};

if (typeof window !== 'undefined') {
  const {
    getBuildNumber,
    getDeviceId,
    getSystemVersion,
    getUniqueId,
    getVersion,
  } = require('react-native-device-info');

  HEADERS = {
    'Content-Type': 'application/json',
    'X-Fingerprint': getUniqueId(),
    'X-Device': getDeviceId(),
    'X-Platform': Platform.OS,
    'X-OS-Version': getSystemVersion(),
    'X-App-Version': getVersion(),
    'X-App-Build': getBuildNumber(),
  };
}

export const userReportByIdURL = (id: string) =>
  `${hostname}/api/user_reports/${id}`;

export const apiFetcher = (url, opts = {}) => {
  // Create a new AbortController instance for this request
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchOptions = merge(
    {},
    {
      credentials: 'include',
      headers: HEADERS,
    },
    opts,
  );

  fetchOptions.signal = signal;

  const promise = fetch(url, fetchOptions);

  promise.cancel = controller.abort;

  return promise.then(resp => resp.json());
};

export const fetchPins = (
  key = 'get_pins',
  {minLatitude, minLongitude, maxLatitude, maxLongitude},
) => {
  const url =
    GET_PINS_URL +
    '?' +
    qs.stringify({
      min_lat: minLatitude,
      min_long: minLongitude,
      max_lat: maxLatitude,
      max_long: maxLongitude,
    });

  return apiFetcher(url);
};

export const buildShareURL = (region: Region, pins, count) => {
  const params = {
    minLat: region.minLatitude,
    minLon: region.minLongitude,
    maxLat: region.maxLatitude,
    maxLon: region.maxLongitude,
    altitude: region.altitude,
    zoom: region.zoom,
    lat: region.latitude,
    lon: region.longitude,
    pins: pins.map(pin => [pin.latitude, pin.longitude]),
    count,
  };

  return `${hostname}?${qs.stringify(params)}`;
};

export const fetchReports = (
  key = 'reports',
  {
    minLatitude,
    minLongitude,
    maxLatitude,
    maxLongitude,
    latitude,
    longitude,
    countryCode,
  },
) => {
  const params = {
    min_lat: minLatitude,
    lat: latitude,
    long: longitude,
    countryCode,
    min_long: minLongitude,
    max_lat: maxLatitude,
    max_long: maxLongitude,
  };

  return apiFetcher(REPORTS_LIST_URL + '?' + qs.stringify(params), {});
};

export const fetchUserPins = (
  key = 'get_user_pins',
  {minLatitude, minLongitude, maxLatitude, maxLongitude},
) => {
  const url =
    GET_USER_REPORTS_URL +
    '?' +
    qs.stringify({
      min_lat: minLatitude,
      min_long: minLongitude,
      max_lat: maxLatitude,
      max_long: maxLongitude,
    });

  return apiFetcher(url);
};

export const buildMapImageURL = ({region, width, locale, height}) =>
  `https://i.covy.app/?${qs.stringify({
    lat: region.latitude,
    lon: region.longitude,
    minLat: region.minLatitude,
    minLon: region.minLongitude,
    maxLat: region.maxLatitude,
    maxLon: region.maxLongitude,
    width,
    height,
    locale,
  })}`;

export const createUserReport = ({
  ipAddress,
  deviceUid,
  symptoms,
  latitude,
  locationAccuracy,
  longitude,
  traveledRecently,
}) =>
  apiFetcher(CREATE_USER_REPORT_URL, {
    method: 'POST',
    body: JSON.stringify({
      user_report: {
        ip_address: ipAddress,
        device_uid: deviceUid,
        symptoms: symptoms.join(','),
        location_accuracy: locationAccuracy,
        latitude,
        longitude,
        traveled_recently: traveledRecently,
      },
    }),
  });
