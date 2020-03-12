import * as React from 'react';
import Head from 'next/head';
import Numeral from 'numeral';
import {useRouter} from 'next/router';
import {buildMapImageURL} from '../api';

export const MapHeadTags = React.memo(
  ({
    region,
    countryCode,
    confirmedCaseCount = 0,
    sickCount = 0,
    lastUpdated,
  }) => {
    const {asPath} = useRouter();
    let titleLabel = `Covy | Real-time Corona Virus Map`;

    let descriptionLabel = `Covy is the easiest way to track the spread of the novel Coronavirus (COVID-19).`;

    if (confirmedCaseCount && confirmedCaseCount > 0) {
      titleLabel = `${Numeral(confirmedCaseCount).format(
        '0,0',
      )}+ cases of Corona Virus | Covy`;

      descriptionLabel = 'Covy lets you see ';
    } else if (sickCount && sickCount > 0) {
      titleLabel = `${Numeral(sickCount).format(
        '0,0',
      )}+ people reported having Corona Virus | Covy`;
    }

    const description = (
      <React.Fragment key={`description-${descriptionLabel}`}>
        <meta name="description" content={descriptionLabel} />
        <meta property="og:description" content={descriptionLabel} />
        <meta name="twitter:description" content={descriptionLabel} />
      </React.Fragment>
    );

    const title = (
      <React.Fragment key={`title-${titleLabel}`}>
        <title>{titleLabel}</title>>
        <meta property="og:title" content={titleLabel} />
        <meta name="twitter:title" content={titleLabel} />
      </React.Fragment>
    );

    const imageTag = region && (
      <React.Fragment key={`image-${region.latitude}-${region.longitude}`}>
        <meta property="og:image:width" content={'1200'} />
        <meta property="og:image:height" content={'630'} />
        <meta property="og:image:type" content="image/png" />
        <meta
          property="og:image:url"
          content={buildMapImageURL({region, width: 1200, height: 630})}
        />
        <meta name="twitter:card" content="summary_large_image" />

        <meta
          name="twitter:image"
          content={buildMapImageURL({region, width: 1200, height: 630})}></meta>
      </React.Fragment>
    );

    return (
      <Head>
        {title}
        {description}
        {imageTag}
        <meta
          key="og:site_name"
          property="og:site_name"
          content="Covy"
          key="site_name"
        />
        <meta property="og:url" content={asPath} key={`url/${asPath}`} />
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
      </Head>
    );
  },
);
