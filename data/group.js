const CONFIRMED = require("./confirmed.json");
const DEATHS = require("./deaths.json");
const RECOVERED = require("./recovered.json");
const dateFns = require("date-fns");

const fs = require("fs");
const lodash = require("lodash");
const path = require("path");

const results = {};

const CONFIRMED_GROUPS = lodash.groupBy(CONFIRMED, "Country/Region");
const DEATHS_GROUPS = lodash.groupBy(DEATHS, "Country/Region");
const RECOVERED_GROUPS = lodash.groupBy(RECOVERED, "Country/Region");

const totals = (confirmed, recover, cumulative) => {
  return {
    ongoing: cumulative - recover - dead,
    cumulative,
    recover: recover,
    dead: dead,
    new: _new,
    counties
  };
};

Object.entries(CONFIRMED_GROUPS).forEach(([country, groups], index) => {
  const recoveredGroup = RECOVERED_GROUPS[country];
  const deathGroups = DEATHS_GROUPS[country];

  const {
    ["Province/State"]: state,
    ["Country/Region"]: _country,
    Lat: latitude,
    Long: longitude,
    ...dates
  } = groups[0];

  const infections = {};
  const growth = {};
  let lastConfirm = 0;
  let lastRecover = 0;
  let lastDead = 0;
  Object.keys(dates).forEach((date, index) => {
    let recover = 0;
    recoveredGroup.forEach(dates => {
      recover += dates[date];
    });

    let dead = 0;
    deathGroups.forEach(dates => {
      dead += dates[date];
    });

    let confirm = 0;
    groups.forEach(dates => {
      confirm += dates[date];
    });

    const _growth = {
      cumulative: confirm / lastConfirm
    };

    lastConfirm = confirm;
    lastRecover = recover;
    lastDead = dead;
    const _date = dateFns.parse(date, "M/dd/yy", new Date());
    if (dateFns.isAfter(dateFns.subDays(new Date(), 21), _date)) {
      return;
    }

    if (lodash.isFinite(_growth.cumulative)) {
      growth[date] = _growth;
    }

    infections[date] = {
      ongoing: confirm - recover - dead,
      cumulative: confirm,
      recover: recover,
      dead,
      new: confirm - lastConfirm
    };
  });

  if (lastConfirm > 0) {
    let __country = country;

    if (state === "Hong Kong") {
      __country = "Hong Kong";
    } else if (country === "Korea, South") {
      __country = "South Korea";
    } else if (country.includes("Iran")) {
      __country = "Iran";
    } else if (country.includes("Palest")) {
      __country = "Gaza";
    }

    results[__country] = {
      latitude,
      longitude,
      growth,
      infections
    };
  }
});

delete results["US"];

const SAVE_PATH = path.resolve(__dirname, "../frontend/data/global.json");

fs.writeFileSync(SAVE_PATH, JSON.stringify(results, null, 2));
console.log("Saved to", SAVE_PATH);
