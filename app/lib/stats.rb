class Stats
  COUNTRY_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/2/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&outSR=102100&resultOffset=0&resultRecordCount=100&cacheHint=true"
  TOTALS_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/cases_time_v3/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Report_Date_String%20desc&outSR=102100&resultOffset=0&resultRecordCount=2000&cacheHint=true"
  DEATHS_URL = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22Deaths%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&outSR=102100&cacheHint=true"

  def self.faraday(url)
    Faraday.new(
      url: url,
      headers: {'Content-Type' => 'application/json'}
    )
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