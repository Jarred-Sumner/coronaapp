import * as React from 'react';

export const TitleSEOTag = ({title}: {title: string}) => [
  <title key={`title-${title}`}>{title}</title>,
  <meta key={`title-${title}-og`} property="og:title" content={title} />,
  <meta key={`title-${title}-twitter`} name="twitter:title" content={title} />,
];

export const ImageSEOTag = ({
  url,
  width,
  height,
}: {
  url: string;
  width: number;
  height: number;
}) => [
  <meta
    key={`og:image:width-${url}`}
    property="og:image:width"
    content={`${width}`}
  />,
  <meta
    key={`og:image:height-${url}`}
    property="og:image:height"
    content={`${height}`}
  />,
  <meta
    key={`og:image:type-${url}`}
    property="og:image:type"
    content="image/png"
  />,
  <meta key={`og:image:url-${url}`} property="og:image:url" content={url} />,
  <meta
    key={`twitter:card"-${url}`}
    name="twitter:card"
    content="summary_large_image"
  />,
  <meta
    key={`twitter:image"-${url}`}
    name="twitter:image"
    content={url}></meta>,
];

export const DescriptionSEOTag = ({description}) => [
  <meta
    key={`name="description"-${description}`}
    name="description"
    content={description}
  />,
  <meta
    key={`property="og:description-${description}`}
    property="og:description"
    content={description}
  />,
  <meta
    key={`name="twitter:description-${description}`}
    name="twitter:description"
    content={description}
  />,
];
