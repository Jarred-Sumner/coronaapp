import {PixelRatio} from 'react-native';

const FALLBACKS = [
  require('assets/SelfReported@2x.png').default,
  require('assets/ConfirmedCase@2x.png').default,
  require('assets/SelfReported_Faded@2x.png').default,
  require('assets/ConfirmedCase_Faded@2x.png').default,
];

export default {
  selected: {
    user_report: {
      uri:
        [
          require('assets/SelfReported.png').default,
          require('assets/SelfReported@2x.png').default,
          require('assets/SelfReported@3x.png').default,
        ][PixelRatio.get()] || FALLBACKS[0],
      width: 30,
      height: 30,
    },
    infection: {
      uri:
        [
          require('assets/ConfirmedCase.png').default,
          require('assets/ConfirmedCase@2x.png').default,
          require('assets/ConfirmedCase@3x.png').default,
        ][PixelRatio.get()] || FALLBACKS[1],
      width: 30,
      height: 30,
    },
  },
  unselected: {
    user_report: {
      uri:
        [
          require('assets/SelfReported_Faded.png').default,
          require('assets/SelfReported_Faded@2x.png').default,
          require('assets/SelfReported_Faded@3x.png').default,
        ][PixelRatio.get()] || FALLBACKS[2],
      width: 30,
      height: 30,
    },
    infection: {
      uri:
        [
          require('assets/ConfirmedCase_Faded.png').default,
          require('assets/ConfirmedCase_Faded@2x.png').default,
          require('assets/ConfirmedCase_Faded@3x.png').default,
        ][PixelRatio.get()] || FALLBACKS[3],
      width: 30,
      height: 30,
    },
  },
};
