export namespace TotalEndpoint {
  export interface TotalInfection {
    updated_at: Date;
    infections: Infections;
    delta: Delta;
    id: string;
  }
  export interface Delta {
    confirm: number;
    recover: number | null;
  }
  export interface Infections {
    china: number;
    elsewhere: number;
    confirm: number;
    deaths: number | null;
    recover: number | null;
  }
}

export namespace CountryEndpoint {
  export interface CountryInfection {
    label: string;
    latitude: number;
    updated_at: Date;
    longitude: number;
    id: string;
    infections: Infections;
  }

  export interface Infections {
    confirm: number;
    dead: number;
    recover: number;
  }
}

export type TweetResponse = {
  data: Array<Tweet>;
  count: number;
  offset: number;
  limit: number;
};
type TweetMedia = {
  id: number;
  id_str: string;
  indices: Array<number>;
  media_url: string;
  media_url_https: string;
  url: string;
  display_url: string;
  expanded_url: string;
  type: 'photo';
  sizes: {
    thumb: {w: number; h: number; resize: 'crop' | 'fit'};
    medium: {w: number; h: number; resize: 'crop' | 'fit'};
    small: {w: number; h: number; resize: 'crop' | 'fit'};
    large: {w: number; h: number; resize: 'crop' | 'fit'};
  };
  source_user_id: number;
  source_user_id_str: string;
};

export type Tweet = {
  id: number;
  timestamp: string;
  photo_url: string;
  username: string;
  tweet_url: string;
  text: string;
  media: Array<TweetMedia>;
  url: string;
  url_preview: URLPreview | null;
};

export type URLPreview = {
  author?: string;
  date?: string;
  description?: string;
  image?: string;
  logo?: string;
  publisher?: string;
  title?: string;
  url: string;
};

type CountryMap = {
  [key: string]: number;
};
export type SelfReportedResponse = {
  last_updated: string;
  interval: {
    week: CountryMap;
    month: CountryMap;
    year: CountryMap;
  };
  delta: {
    week: CountryMap;
    month: CountryMap;
    year: CountryMap;
  };
  object: string;
};

export type PinResponse = {
  pins: Array<ConfirmedPin>;
};

export type ConfirmedPin = {
  id: number;
  country: string;
  last_updated: string;
  province: string;
  label: string;
  latitude: number;
  longitude: number;
  infections: {
    selfReported: number;
    confirm: number;
    dead: number;
    recover: number;
  };
};

export namespace UserReportListRequest {
  export interface Response {
    data: UserReport[];
    count: number;
    offset: number;
  }

  export interface ShowResponse {
    data: UserReport;
  }

  export interface UserReport {
    id: string;
    created_at: Date;
    symptoms: string[];
    latitude: number;
    traveled_recently: boolean;
    longitude: number;
    location: Location;
  }

  export interface Location {
    country: string;
    city: string;
    state: string;
    country_code: string;
  }
}
