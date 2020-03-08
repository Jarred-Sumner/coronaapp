import InAppBrowser from 'react-native-inappbrowser-reborn';
import {Tweet} from '../API_TYPES';
import {Linking, Platform} from 'react-native';
import {getAndroidDeepLink, getIOSDeepLink} from 'url-to-deep-link';

export const openLink = async (url: string) => {
  console.log(url);
  if (!url) {
    return;
  }

  const deepLink = Platform.select({
    ios: getIOSDeepLink(url),
    android: false,
  });

  if (deepLink && (await Linking.canOpenURL(deepLink))) {
    return Linking.openURL(deepLink);
  }

  try {
    if (await InAppBrowser.isAvailable()) {
      return await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'cancel',
        readerMode: true,
        animated: true,
        modalEnabled: false,
        modalPresentationStyle: 'automatic',
        enableBarCollapsing: false,
        preferredBarTintColor: '#000',
        preferredControlTintColor: '#fff',

        // Android Properties
        showTitle: true,
        toolbarColor: '#6200EE',
        secondaryToolbarColor: 'black',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // // Specify full animation resource identifier(package:anim/name)
        // // or only resource name(in case of animation bundled with app).
        // animations: {
        //   startEnter: "slide_in_right",
        //   startExit: "slide_out_left",
        //   endEnter: "slide_in_left",
        //   endExit: "slide_out_right"
        // }
      });
    } else Linking.openURL(url);
  } catch (error) {
    // Sentry.captureException(error);
  }
};
