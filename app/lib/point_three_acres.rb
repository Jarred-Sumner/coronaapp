module PointThreeAcres
  SCRAPE_URL = "https://cryptic-anchorage-53515.herokuapp.com/scrape"
  STATES_MAPPING = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}.with_indifferent_access

  def self.fetch_raw_data
    if Rails.env.development?
      File.read("#{Rails.root}/db/3point1.json")
    else
      Faraday.new(url: SCRAPE_URL).get.body
    end
  end

  def self.parse_date(string)
    return nil if string.blank? || !string.include?("/")

    Date.parse(string)
  end

  def self.format_id(props)
    String("thx_yu_guo/#{Zlib.crc32(props["id"])}")
  end

  def self.format_case(props)
    arrival_date  = parse_date(props["arrival_date"])
    cured_date = parse_date(props["cured_date"])
    confirmed_date = parse_date(props["confirmed_date"])
    last_updated = [cured_date, confirmed_date, arrival_date].compact.max
    count = props["people_count"]
    recover_count =  props["cured_date"] == "Recovered" || cured_date ? count : 0
    die_count = props["die_count"]

    state_name = STATES_MAPPING[props["state_name"]]
    county = Map.find_county(props["county"], state_name)
    return nil if county.nil?

    id = format_id(props)

    {
      "id": id,
      "country":  "us",
      "last_updated": last_updated,
      "object": "infection",
      "province": state_name,
      "state": state_name,
      "county": county,
      "kml": "#{county.kml_path}",
      "label": props["area"],
      "latitude": county.point.y,
      "longitude": county.point.x,
      "infections": {
        'confirm': count,
        'dead': die_count || 0,
        'recover': recover_count,
      }
    }
  end

  def self.get_data
    ActiveSupport::JSON.decode(fetch_raw_data).with_indifferent_access
  end

  def self.fetch_case_by_id(id)
    data = get_data

    if row = data.find { |row| format_id(row) }
      format_case(row).as_json
    else
      nil
    end
  end

  def self.fetch_cases(min_lat: nil, min_long: nil, max_lat: nil, max_long: nil)
    box = nil

    if min_lat && max_lat && min_lat && min_long
      box = RGeo::Cartesian::BoundingBox.create_from_points(
        Map.geo_factory.point(Float(max_long), Float(max_lat)),
        Map.geo_factory.point(Float(min_long), Float(min_lat)),
      ).to_geometry
    end

    data = get_data

    data["case"].map do |props|
      row = format_case(props)&.with_indifferent_access
      next if row.nil?
      county = row['county']

      next if county.nil?

      if box.present?
        next if !county.contains?(box)
      end

      row
    end.compact
  end
end