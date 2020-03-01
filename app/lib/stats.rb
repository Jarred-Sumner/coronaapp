class Stats
  COUNTRY_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/2/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&outSR=102100&resultOffset=0&resultRecordCount=100&cacheHint=true"
  TOTALS_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/cases_time_v3/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Report_Date_String%20desc&outSR=102100&resultOffset=0&resultRecordCount=2000&cacheHint=true"
  DEATHS_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Deaths%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&outSR=102100&cacheHint=true"
  CONFIRMED_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query"

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


  def self.confirmed_pins(min_lat:, min_long:, max_lat:, max_long:)
    uri = Addressable::URI.parse(CONFIRMED_URL)
    uri.query_values = confirmed_pins_query(min_lat, min_long, max_lat, max_long)
    confirmed_pins_url = uri.to_s

    resp = JSON.parse(faraday(confirmed_pins_url).get.body).with_indifferent_access

    resp["features"].map do |a|
      props = a["attributes"]


      # "OBJECTID"=>121, "Province_State"=>"Jiangxi", "Country_Region"=>"Mainland China", "Last_Update"=>1583025190000, "Lat"=>27.614008270636, "Long_"=>115.722093542185, "Confirmed"=>935, "Deaths"=>1, "Recovered"=>831
      {
        id: props["OBJECTID"],
        "country":  props["Country_Region"],
        "last_updated": Time.at(props["Last_Update"] / 1000),
        "province":  props["Province_State"],
        label: "#{props["Province_State"]}, #{props["Country_Region"]}",
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

  def self.death_count
    resp = JSON.parse(faraday(DEATHS_URL).get.body).with_indifferent_access

    resp["features"].map do |a|
      props = a["attributes"]

      props["value"]
    end.first
  end

  def self.total_data
    resp = JSON.parse(faraday(TOTALS_URL).get.body).with_indifferent_access

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
    resp = JSON.parse(faraday(COUNTRY_URL).get.body).with_indifferent_access

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