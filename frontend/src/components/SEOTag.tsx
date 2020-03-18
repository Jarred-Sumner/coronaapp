import * as React from 'react';

export const TitleSEOTag = ({title}: {title: string}) => (
  <React.Fragment key={`title-${title}`}>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta name="twitter:title" content={title} />
  </React.Fragment>
);

export const ImageSEOTag = ({
  url,
  width,
  height,
}: {
  url: string;
  width: number;
  height: number;
}) => (
  <React.Fragment key={`image-${url}`}>
    <meta property="og:image:width" content={`${width}`} />
    <meta property="og:image:height" content={`${height}`} />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:url" content={url} />
    <meta name="twitter:card" content="summary_large_image" />

    <meta name="twitter:image" content={url}></meta>
  </React.Fragment>
);

export const DescriptionSEOTag = ({description}) => (
  <React.Fragment key={`description-${description}`}>
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
    <meta name="twitter:description" content={description} />
  </React.Fragment>
);
