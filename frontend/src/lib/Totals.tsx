import {isSameDay} from 'date-fns/esm';

export type Totals = {
  cumulative: number;
  new: number;
  ongoing: number;
  recover: number;
  dead: number;
  counties: Set<string>;
  countries: Set<string>;
  from: Set<string>;
};
export type TotalsMap = Map<Date, Totals>;

export function getDateTotals(date: Date, map: TotalsMap): Totals | null {
  const dates = [...map.keys()].reverse();

  for (let _date of dates) {
    if (isSameDay(date, _date)) {
      return map.get(_date);
    }
  }

  return null;
}
