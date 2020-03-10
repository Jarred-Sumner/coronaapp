class Stats
  COUNTRY_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/2/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&outSR=102100&resultOffset=0&resultRecordCount=100&cacheHint=true"
  TOTALS_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/cases_time_v3/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Report_Date_String%20desc&outSR=102100&resultOffset=0&resultRecordCount=2000&cacheHint=true"
  DEATHS_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Deaths%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&outSR=102100&cacheHint=true"
  CONFIRMED_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query"
  CONFIRMED_URL_KEY = "HOPINKS/https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query"
  CONFIRMED_URL_UPDATED_AT_KEY = "Stats/hopkins/CONFIRMED_URL_UPDATED_AT_KEY"
  CONFIRMED_FALLBACK_URL = "https://services.arcgis.com/5T5nSi527N4F7luB/arcgis/rest/services/COVID_19_CasesByCountry(pt)_VIEW/FeatureServer/0/query"

  ENABLE_FALLBACK = false

  def self.faraday(url)
    Faraday.new(
      url: url,
      headers: {'Content-Type' => 'application/json'}
    )
  end

  def self.confirmed_pins_query(min_lat, min_long, max_lat, max_long)
    { where: '1=1',
      returnGeometry: 'false',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      maxRecordCountFactor: '1000',
      orderByFields: '',
      outSR: '102100',
      resultOffset: '0',
      resultRecordCount: '5000',
      cacheHint: 'true',
      f: "json",
      quantizationParameters: {"mode":"view","originPosition":"upperLeft","tolerance":19567.879241002935,"extent":{"xmin": min_lat,"ymin":min_long,"xmax":max_lat,"ymax":max_long,"spatialReference":{"wkid":4326,"latestWkid":4326}}}.to_json
    }
    end

    def self.confirmed_pins_fallback_query(min_lat, min_long, max_lat, max_long)
      {
        f: 'json',
        where: '1=1',
        returnGeometry: 'false',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: '*',
        maxRecordCountFactor: '4',
        orderByFields: 'cum_conf DESC',
        outSR: '102100',
        resultOffset: '0',
        resultRecordCount: '8000',
        cacheHint: 'true',
        quantizationParameters: {
          mode: 'view',
          originPosition: 'upperLeft',
          tolerance: 1.0583354500042337,
          extent: {
            xmin: min_lat,
            ymin: min_long,
            xmax: max_lat,
            ymax: max_long,

            spatialReference: { wkid: 4326, latestWkid: 4326 }
          }
        }.to_json
      }
    end

    def self.confirmed_pins_needs_update?
      updated_at = Rails.cache.fetch(CONFIRMED_URL_UPDATED_AT_KEY)
      return true if updated_at == nil

      updated_at < 15.minutes.ago
    end

    def self.confirmed_pins(min_lat:, min_long:, max_lat:, max_long:)
      if ENABLE_FALLBACK
        confirmed_pins_fallback(min_lat: min_lat, min_long: min_long, max_lat: max_lat, max_long: max_long)
      else
        pins = confirmed_pins_hopkins(min_lat: min_lat, min_long: min_long, max_lat: max_lat, max_long: max_long)
        if confirmed_pins_needs_update?
          ConfirmedPinsWorker.perform_async
        end
        pins
      end
    end

    def self.fetch_confirmed_pins_hopkins(min_lat: 0, min_long: 0, max_lat: 0, max_long: 0)
      uri = Addressable::URI.parse(CONFIRMED_URL)
      uri.query_values = confirmed_pins_query(min_lat, min_long, max_lat, max_long)
      confirmed_pins_url = uri.to_s

      faraday(confirmed_pins_url).get.body
    end

    def self.confirmed_pins_hopkins(min_lat: 0, min_long: 0, max_lat: 0, max_long: 0)


      resp = Rails.cache.fetch(CONFIRMED_URL_KEY) do
        body = fetch_confirmed_pins_hopkins(min_lat: min_lat, min_long: min_long, max_lat: max_lat, max_long: max_long)

        if body.present?
          Rails.cache.write(Stats::CONFIRMED_URL_UPDATED_AT_KEY, DateTime.now.iso8601)
        end

        body
      end

      if resp.blank?
        return []
      end

      if resp.is_a? String
        resp = JSON.parse(resp).with_indifferent_access
      end

      resp["features"].map do |a|
        props = a["attributes"]

        # "OBJECTID"=>121, "Province_State"=>"Jiangxi", "Country_Region"=>"Mainland China", "Last_Update"=>1583025190000, "Lat"=>27.614008270636, "Long_"=>115.722093542185, "Confirmed"=>935, "Deaths"=>1, "Recovered"=>831
        {
          id: props["OBJECTID"],
          "country":  props["Country_Region"],
          "last_updated": Time.at(props["Last_Update"] / 1000),
          "object": "infection",
          "province":  props["Province_State"],
          label: [props["Province_State"], props["Country_Region"]].compact.uniq.join(" "),
          "latitude": props["Lat"],
          "longitude": props["Long_"],
          "infections": {
            'confirm': props["Confirmed"],
            'dead': props["Deaths"],
            'recover': props["Recovered"],
          }
        }
      end
    end

  def self.confirmed_pins_fallback(min_lat:, min_long:, max_lat:, max_long:)
    uri = Addressable::URI.parse(CONFIRMED_FALLBACK_URL)
    uri.query_values = confirmed_pins_fallback_query(min_lat, min_long, max_lat, max_long)
    confirmed_pins_url = uri.to_s


    resp = JSON.parse(faraday(confirmed_pins_url).get.body).with_indifferent_access

    resp["features"].map do |a|
      props = a["attributes"]


        # attributes: {
        #   ADM0_NAME: "ROMANIA",
        #   ADM1_NAME: null,
        #   DateOfReport: 1583193600000,
        #   DateOfDataEntry: 1583280000000,
        #   new_conf: null,
        #   new_clin: null,
        #   new_susp: null,
        #   new_death: null,
        #   cum_conf: 4,
        #   cum_clin: null,
        #   cum_susp: null,
        #   cum_death: null,
        #   EPIWeek: 10,
        #   EPIYear: 2020,
        #   Comment: null,
        #   ID: 37642,
        #   GUID: "26eaed41-b340-4f38-90e3-9392e04420c6",
        #   CENTER_LON: 24.96990758,
        #   CENTER_LAT: 45.84360558,
        #   ADM0_VIZ_NAME: "Romania",
        #   Short_Name_ZH: "罗马尼亚",
        #   Short_Name_FR: "Roumanie",
        #   Short_Name_ES: "Rumania",
        #   Short_Name_RU: "Румыния",
        #   Short_Name_AR: "رومانيا"
        #   }
        {
          id: props["GUID"],
          "country":  props["ADM0_VIZ_NAME"],
          "last_updated": Time.at(props["DateOfReport"] / 1000),
          "object": "infection",
          "province":  props["ADM1_NAME"],
          label: [props["ADM1_NAME"], props["ADM0_VIZ_NAME"]].compact.uniq.join(" "),
          "longitude": props["CENTER_LON"],
          "latitude": props["CENTER_LAT"],
          "infections": {
            'confirm': props["cum_conf"] || 0,
            'dead': props["cum_death"] || 0,
            'recover': props["Recovered"] || 0,
          }
        }

    end
  end

  def self.death_count
    resp = Rails.cache.fetch("Stats/#{DEATHS_URL}", expires_in: 2.minutes) do
      JSON.parse(faraday(DEATHS_URL).get.body).with_indifferent_access
    end

    resp["features"]&.map do |a|
      props = a["attributes"]

      props["value"]
    end&.first
  end

  def self.total_data
    resp = Rails.cache.fetch("Stats/#{TOTALS_URL}", expires_in: 2.minutes) do
      faraday(TOTALS_URL).get.body
    end

    if resp.is_a? String
      resp = JSON.parse(resp).with_indifferent_access
    end

    deaths = self.death_count

    last_shown_deaths = false
    resp["features"].map.with_index do |a, index|
      props = a["attributes"]
      _deaths = !last_shown_deaths ? deaths : nil
      last_shown_deaths = true

      {
        "updated_at": Time.at(props["Report_Date"] / 1000),
        "infections": {
          'china': props["Mainland_China"],
          "dead": _deaths,
          'elsewhere': props["Other_Locations"],
          'confirm': props["Total_Confirmed"],
          'recover': props["Total_Recovered"],
        },
        "delta": {
          'confirm': props["Delta_Confirmed"],
          'recover': props["Delta_Recovered"],
        },
        "id": String(props["ObjectId"])
      }
    end

  end

  def self.normalize_country(country)
    if country == "Mainland China"
      "China"
    else
      country
    end
  end

  def self.country_data
    resp = Rails.cache.fetch("Stats/#{COUNTRY_URL}", expires_in: 2.minutes) do
       JSON.parse(faraday(COUNTRY_URL).get.body).with_indifferent_access
    end

    resp["features"].map do |a|
      props = a["attributes"]
      region = normalize_country(props["Country_Region"])
      next if region == "Others"

      {
        "label": region,
        "latitude": props["Lat"],
        "country": region,
        "updated_at": Time.at(props["Last_Update"] / 1000),
        "longitude": props["Long_"],
        "id": String(props["OBJECTID"]),
        "infections": {
          'confirm': props["Confirmed"],
          'dead': props["Deaths"],
          'recover': props["Recovered"],
        }
      }
    end.compact
  end
end