// Based on https://github.com/zeit/next.js/tree/canary/examples/with-react-native-web
// and https://github.com/expo/expo-cli/blob/master/packages/webpack-config/web-default/index.html
import NextDocument, {Head, Main, NextScript} from 'next/document';
import * as React from 'react';
import config from '../app.json';
import {AppRegistry} from 'react-native';
import {COLORS} from '../src/lib/theme';
import {TitleSEOTag, DescriptionSEOTag} from '../src/components/SEOTag';

export const style = `

*::-webkit-scrollbar * {
  background:transparent; // manage scrollbar background color here
}

*::-webkit-scrollbar {
  background-color: transparent;
  width:12px;
}

/* background of the scrollbar except button or resizer */
*::-webkit-scrollbar-track {
  background-color: transparent;
}

/* scrollbar itself */
*::-webkit-scrollbar-thumb {
  background-color:#666 !important;
  border-radius:12px;
  border:4px solid transparent;
}

/* set button(top and bottom of the scrollbar) */
*::-webkit-scrollbar-button {display:none;}

/**
 * Building on the RNWeb reset:
 * https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/StyleSheet/initialRules.js
 */
body {
  background-color: #000;
}

.ListClicker {
  cursor: pointer;
  user-select: none;
}

.__react_component_tooltip {
  color: white;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
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
  flex-basis: 100%;
  flex-direction: column;
  flex-grow: 1;
  display: flex;
  height: 100%;
  width: 100%;
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



.MapOverlay-footerSide {
  flex: 0;
  flex-direction: row;

  justify-content: flex-end;

  align-items: flex-end;
  pointer-events: none !important;
}


.gm-style > div > a[target="_blank"] {
  display: none !important;
}


@media (max-width: 600px) {
  #Layout {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
  }

  .MapOverlay-footer {
    align-items: flex-start;
  }

  #map-view {
    width: 100%;
    height: calc(100% - 350px);
    position: relative;
  }

  .MapOverlay-footer {
    position: absolute;
    display: flex;
    padding-bottom: 16px;
    padding-left: 12px;
    padding-right: 12px;
    left: 0;
    right: 0;
    width: auto;
    bottom: 0;

    pointer-events: none !important;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }

  .PullyContainer {
    width: 100%;
    height: 350px;
    display: flex;

    background-color: rgb(21,31,46);
  }


  .PullyContainer > * {
    pointer-events: auto;
  }
}




@media (min-width: 600px) {
  .MapOverlay-footer {
    position: absolute;
    top: 0;
    left: 0;
    margin: 16px 16px;
    flex: 1;
    display: flex;
    width: auto;
    pointer-events: none;
    right: 0;
    flex-direction: row;
    justify-content: space-between;
  }

  .PullyContainer {
    width: calc(100% - 300px);
    max-width: 512px;
    min-width: 200px;
    height: 100%;
    display: flex;
    box-shadow: -2px 2px 15px rgba(0,0, 0.25);
    overflow: visible;
    background-color: rgb(21,31,46);
  }

  #Layout {
    flex: 1;
    display: flex;
    height: 100vh;
  }

  #map-view {
    flex: 1;
    display: flex;
    height: 100vh;
    width: auto;
    flex: 1;
    position: relative;
  }
}



  .recharts-wrapper {
    color: rgb(203, 203, 203);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Ubuntu, 'Helvetica Neue', sans-serif;
    font-size: 14px;
  }

  .recharts-cartesian-axis-tick-value {
    fill: rgb(203, 203, 203) !important;
  }

  .recharts-default-tooltip {
    background-color: ${COLORS.dark} !important;
    border-color: ${COLORS.darkMedium} !important;
    padding: 6px 8px !important;
    border-radius: 4px;
    box-shadow: 1px 1px 1px #000;
  }

  .recharts-reference-line .recharts-label {
    font-weight: bold;
  }

  .recharts-tooltip-label {
    padding-bottom: 8px !important;
    margin-left: -8px !important;
    margin-right: -8px !important;
    padding-left: 8px; !important;
    padding-right: 8px !important;
    margin-bottom: 8px !important;
    box-sizing: content-box;
    border-bottom: 1px solid ${COLORS.darkMedium} !important;
  }
`;

export async function getInitialProps({renderPage}) {
  AppRegistry.registerComponent(config.name, () => Main);
  const {getStyleElement} = AppRegistry.getApplication(config.name);
  const page = renderPage({});
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
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />

          <meta key="twitter:site" name="twitter:site" content="@covy_app" />
          <meta
            key="twitter:creator"
            name="twitter:creator"
            content="@covy_app"
          />
          <meta
            name="viewport"
            key="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
          />
          <meta
            key="og:site_name"
            property="og:site_name"
            content="Covy"
            key="site_name"
          />

          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        </Head>
        <body>
          <Main />
          <NextScript />

          {process.env.NODE_ENV === 'production' && (
            <>
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
            </>
          )}
        </body>
      </html>
    );
  }
}

export default Document;
