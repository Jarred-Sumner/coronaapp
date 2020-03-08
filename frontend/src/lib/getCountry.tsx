let data = {};
let nameMap = {};
let codeMap = {};

let hasLoadedData = false;
const loadData = () => {
  if (hasLoadedData) {
    return;
  }
  data = require('./countryData.json');
  data.forEach(mapCodeAndName);
  hasLoadedData = true;
};

function mapCodeAndName({name, code}) {
  nameMap[name.toLowerCase()] = code;
  codeMap[code.toLowerCase()] = name;
}

export function overwrite(countries) {
  loadData();
  if (!countries || !countries.length) return;
  countries.forEach(country => {
    const foundIndex = data.findIndex(({code}) => {
      return code === country.code;
    });
    data[foundIndex] = country;
    mapCodeAndName(country);
  });
}

export function getCode(name) {
  loadData();
  if (
    name.toLowerCase() === 'Mainland China'.toLowerCase() ||
    name.toLowerCase() === 'China'.toLowerCase()
  ) {
    return 'cn';
  }

  if (name.toLowerCase() === 'World'.toLowerCase()) {
    return 'World';
  }

  if (name.toLowerCase() === 'US'.toLowerCase()) {
    return 'us';
  }

  if (name.toLowerCase() === 'United States'.toLowerCase()) {
    return 'us';
  }

  if (name.toLowerCase() === 'UK'.toLowerCase()) {
    return 'gb';
  }

  if (name.toLowerCase() === 'United Kingdom'.toLowerCase()) {
    return 'gb';
  }

  return nameMap[name.toLowerCase()];
}

export function getName(code) {
  loadData();

  return codeMap[code.toLowerCase()];
}

export function getNames() {
  loadData();
  return data.map(({name}) => {
    return name;
  });
}

export function getCodes() {
  loadData();
  return data.map(({code}) => {
    return code;
  });
}

export function getCodeList() {
  loadData();
  return codeMap;
}

export function getNameList() {
  loadData();
  return nameMap;
}

export function getData() {
  loadData();
  return data;
}
