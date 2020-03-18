import {merge} from 'lodash';
import qs from 'qs';
import {INITIAL_REGION} from './routes/RegionContext';

export const PRODUCTION_HOSTNAME = 'https://covy.app';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
export const hostname = IS_PRODUCTION ? '' : 'http://localhost:3000';

export const TOTALS_URL = `${hostname}/api/stats/totals`;
export const COUNTRIES_URL = `${hostname}/api/stats/country`;
export const USER_REPORT_STATS = `${hostname}/api/stats/user_reports`;
export const CREATE_USER_REPORT_URL = `${hostname}/api/user_reports`;
export const GET_USER_REPORTS_URL = `${hostname}/api/user_reports`;
export const GET_STATS_URL = `${hostname}/api/stats/graphs`;
export const REPORTS_LIST_URL = `${hostname}/api/user_reports/list`;
export const GET_PINS_URL = `${hostname}/api/reports`;
export const TWEETS_URL = `${hostname}/api/tweets`;
export const US_TOTALS_URL = `${hostname}/api/stats/graphs/us`;
let HEADERS = {'Content-Type': 'application/json'};

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

export const fetchPins = (key = 'get_pins') => {
  const url = GET_PINS_URL;

  return apiFetcher(url);
};

export const fetchGraphStats = (
  key = 'graph_stats',
  {
    minLatitude,
    minLongitude,
    maxLatitude,
    maxLongitude,
    altitude,
    latitude,
    longitude,
    zoom,
  },
) => {
  const url =
    GET_STATS_URL +
    '?' +
    qs.stringify({
      min_lat: minLatitude,
      min_long: minLongitude,
      latitude,
      longitude,
      zoom,
      max_lat: maxLatitude,
      max_long: maxLongitude,
    });

  return apiFetcher(url);
};

export const buildShareURL = (region, pins, count) => {
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
    zoom,
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
    zoom,
  };

  return apiFetcher(REPORTS_LIST_URL + '?' + qs.stringify(params), {});
};

export const fetchUSTotals = (key = 'us_totals', {}) => {
  return apiFetcher(US_TOTALS_URL, {});
};

export const fetchUserPins = (
  key = 'get_user_pins',
  {minLatitude, minLongitude, maxLatitude, maxLongitude, zoom},
) => {
  const url =
    GET_USER_REPORTS_URL +
    '?' +
    qs.stringify({
      min_lat: minLatitude,
      min_long: minLongitude,
      max_lat: maxLatitude,
      max_long: maxLongitude,
      zoom,
    });

  return apiFetcher(url);
};

const DEVELOPMENT_IMAGE_URL_HOST = 'http://localhost:4023/';
const PRODUCTION_IMAGE_URL_HOST = 'https://i.covy.app/';

const IMAGE_URL_HOST = PRODUCTION_IMAGE_URL_HOST;
export const buildMapImageURL = ({region, width, locale, height, count}) =>
  `${IMAGE_URL_HOST}?${qs.stringify({
    lat: region.latitude,
    lon: region.longitude,
    minLat: region.minLatitude,
    minLon: region.minLongitude,
    maxLat: region.maxLatitude,
    maxLon: region.maxLongitude,
    d:
      region.latitude === INITIAL_REGION.latitude &&
      region.longitude === INITIAL_REGION.longitude
        ? 1
        : 0,
    count,
    zoom: region.zoom,
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
