module PointThreeAcres
  SCRAPE_URL = "https://cryptic-anchorage-53515.herokuapp.com/scrape"

  def fetch_raw_data
    ActiveSupport::JSON.decode(Faraday.new(url: SCRAPE_URL).get.body).with_indifferent_access
  end

  def fetch_cases
    data = fetch_raw_data.with_indifferent_access

    {
      id: props["OBJECTID"],
      "country":  props["Country_Region"],
      "last_updated": Time.at(props["Last_Update"] / 1000),
      "object": "infection",
      "province":  props["Province_State"],
      label: [props["Province_State"], props["Country_Region"]].compact.uniq.join(" "),
      "latitude": Float(props["Lat"]),
      "longitude": Float(props["Long_"]),
      "infections": {
        'confirm': props["num"],
        'dead': props["die_count"],
        'recover': props["Recovered"],
      }
    }
  end
end