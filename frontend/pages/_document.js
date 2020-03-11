// Based on https://github.com/zeit/next.js/tree/canary/examples/with-react-native-web
// and https://github.com/expo/expo-cli/blob/master/packages/webpack-config/web-default/index.html
import NextDocument, {Head, Main, NextScript} from 'next/document';
import * as React from 'react';
import config from '../app.json';
import {AppRegistry} from 'react-native';

export const style = `
/**
 * Building on the RNWeb reset:
 * https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/StyleSheet/initialRules.js
 */
body {
  background-color: #000;
}

html, body, #__next {
  width: 100%;
  /* To smooth any scrolling behavior */
  -webkit-overflow-scrolling: touch;
  margin: 0px;
  padding: 0px;
  /* Allows content to fill the viewport and go beyond the bottom */
  min-height: 100%;
}
#__next {
  flex-shrink: 0;
  flex-basis: auto;
  flex-direction: column;
  flex-grow: 1;
  display: flex;
  flex: 1;
}
html {
  scroll-behavior: smooth;
  /* Prevent text size change on orientation change https://gist.github.com/tfausak/2222823#file-ios-8-web-app-html-L138 */
  -webkit-text-size-adjust: 100%;
  height: 100%;
}
body {
  display: flex;
  /* Allows you to scroll below the viewport; default value is visible */
  overscroll-behavior-y: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -ms-overflow-style: scrollbar;
  overflow-y: hidden;
  overflow-x: hidden;
}
`;

export async function getInitialProps({renderPage}) {
  AppRegistry.registerComponent(config.name, () => Main);
  const {getStyleElement} = AppRegistry.getApplication(config.name);
  const page = renderPage();
  const styles = [
    <style dangerouslySetInnerHTML={{__html: style}} />,
    getStyleElement(),
  ];
  return {...page, styles: React.Children.toArray(styles)};
}

export class Document extends NextDocument {
  static getInitialProps = getInitialProps;
  render() {
    return (
      <html>
        <Head>
          <link rel="preconnect" href="https://maps.googleapis.com" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />

          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-K0GJNSV1P5"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());

      if (location.hostname.indexOf("localhost") === -1) {
        gtag("config", "G-K0GJNSV1P5");
      }`,
            }}
          />

          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default Document;
