import {
  differenceInDays,
  differenceInMinutes,
  format,
  isSameMinute,
  isSameMonth,
  differenceInHours,
  isSameDay,
  differenceInWeeks,
} from 'date-fns/esm';
import React from 'react';
import {Text} from 'react-native';

export type TimestampType = string | Date;

const normalizeTimestamp = (time: TimestampType) => {
  if (typeof time === 'string') {
    return new Date(time);
  } else {
    return time;
  }
};

export const shortFormat = (time: TimestampType, dayOnly): string => {
  const date = normalizeTimestamp(time);
  const now = new Date();

  const hourDiff = Math.abs(differenceInHours(date, now));
  const dayDiff = Math.abs(differenceInDays(date, now));
  const minDiff = Math.abs(differenceInMinutes(date, now));

  if (dayOnly && isSameDay(now, date)) {
    return 'today';
  } else if (isSameMinute(date, now)) {
    return 'just now';
  } else if (minDiff < 60) {
    return `${minDiff}m`;
  } else if (hourDiff < 36) {
    return `${hourDiff}h`;
  } else if (dayDiff < 14) {
    return `${dayDiff}d`;
  } else if (isSameMonth(date, now)) {
    return `${Math.abs(differenceInWeeks(date, now))}d`;
  } else {
    return format(date, 'MMM d');
  }
};

export const shortDateFormat = (time: TimestampType): string => {
  const date = normalizeTimestamp(time);

  return format(date, 'MMMM dd, yyyy');
};

export const Timestamp = React.memo(
  ({
    TextComponent = Text,
    time,
    dayOnly,
    formatter = shortFormat,
    style,
    ...otherProps
  }) => {
    const formattedTime = formatter(time, dayOnly);

    return (
      <TextComponent {...otherProps} style={style}>
        {formattedTime}
      </TextComponent>
    );
  },
);
