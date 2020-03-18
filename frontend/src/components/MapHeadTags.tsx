import * as React from 'react';
import Head from 'next/head';
import Numeral from 'numeral';
import {useRouter} from 'next/router';
import {buildMapImageURL} from '../api';
import {TitleSEOTag, ImageSEOTag, DescriptionSEOTag} from './SEOTag';

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

      descriptionLabel =
        'Covy lets you track Corona Virus cases on a real-time map';
    } else if (sickCount && sickCount > 0) {
      titleLabel = `${Numeral(sickCount).format(
        '0,0',
      )}+ people reported having Corona Virus | Covy`;
    }

    const description = DescriptionSEOTag({description: descriptionLabel});

    const title = TitleSEOTag({title: titleLabel});
    const imageURL = buildMapImageURL({
      region,
      width: 1200,
      height: 630,
      count: confirmedCaseCount,
    });

    console.log({imageURL});

    const imageTag = ImageSEOTag({url: imageURL, width: 1200, height: 630});

    return React.createElement(Head, {}, [
      ...title,
      ...description,
      ...imageTag,
      <meta property="og:url" content={asPath} key={`url/${asPath}`} />,
    ]);
  },
);
