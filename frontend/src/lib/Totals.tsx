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
