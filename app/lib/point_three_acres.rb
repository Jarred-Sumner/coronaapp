module PointThreeAcres
  SCRAPE_URL = "https://cryptic-anchorage-53515.herokuapp.com/scrape"
  SCRAPE_CACHE_KEY = SCRAPE_URL + "__key"
  US_TOTALS_CACHE_KEY = SCRAPE_URL + "__key-US_TOTALS-taoto"
  SCRAPED_AT_CACHE_KEY = "PointThreeAcres/SCRAPED_AT"
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

  def self.fetch_raw_data(force = true)
    if Rails.env.development? && !force
      File.read("#{Rails.root}/db/3point1.json")
    else
      resp = Faraday.new(url: SCRAPE_URL).get
      if resp.success?
        resp.body
      else
        Rails.logger.error "[PointThreeAcres] Failed to fetch.\n#{resp.body}"
        nil
      end
    end
  end

  def self.parse_date(string)
    return nil if string.blank? || !string.include?("/")

    Time.find_zone("US/Pacific").parse(string).to_date
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
      "order": Integer(props["id"][3..-1]),
      "country":  "us",
      "last_updated": last_updated,
      "started_at": arrival_date,
      "confirmed_at": confirmed_date,
      "recovered_at": cured_date,
      "object": "infection",
      "sources": props["links"]&.compact&.map(&:strip),
      "province": state_name,
      "state": state_name,
      "county": county,
      "label": props["city"] || props["area"] || "#{county&.name} County, #{state_name}",
      "latitude": county.point.y,
      "longitude": county.point.x,
      "infections": {
        'confirm': count,
        'total': props['num'],
        'dead': die_count || 0,
        'recover': recover_count,
      }
    }
  end

  def self.get_data
    json = Rails.cache.fetch(SCRAPE_CACHE_KEY)
    return nil if json.blank?
    ActiveSupport::JSON.decode(json).with_indifferent_access
  end

  def self.fetch_case_by_id(id)
    data = get_data

    if row = data.find { |row| format_id(row) }
      format_case(row).as_json
    else
      nil
    end
  end

  def self.uncached_us_totals_by_day
    totals_by_day = {}
    last_day = nil
    last_totals = {
      dead: 0,
      recover: 0,
      confirm: 0
    }

    pins = PointThreeAcres
      .fetch_cases(flatten: false)
      .sort_by { |pin| pin['order'] }

    pins
      .each do |pin|
        day = pin["confirmed_at"].strftime("%Y-%m-%d")
        totals = totals_by_day[day]
        totals ||= {}.merge(last_totals)


        confirmed = pin.dig("infections", "confirm")
        recover = pin.dig("infections", "recover")
        dead = pin.dig("infections", "dead")

        totals[:dead] = totals[:dead] + dead
        totals[:recover]  = totals[:recover] + recover
        totals[:confirm] = [totals[:total], pin.dig("infections", "total")].compact.max

        totals_by_day[day] = totals
        last_totals = totals
        last_day = day
      end

    {
      totals: totals_by_day.sort.to_h,
      object: 'totals'
    }.as_json
  end

  def self.us_totals_by_day
    Rails.cache.fetch(US_TOTALS_CACHE_KEY) do
      uncached_us_totals_by_day.to_json
    end
  end

  def self.update_us_totals!
    Rails.cache.write(US_TOTALS_CACHE_KEY, uncached_us_totals_by_day.to_json)
  end


  def self.update_fetched_cases
    Rails.logger.info "[PointThreeAcres] Beginning to fetch..."
    data = fetch_raw_data(true)
    Rails.logger.info "[PointThreeAcres] Fetched."

    if data.present?
      now = DateTime.now
      Rails.cache.write(SCRAPE_CACHE_KEY, data)
      Rails.cache.write(SCRAPED_AT_CACHE_KEY, now.iso8601)
      update_us_totals!
      ConfirmedPinsWorker.new.perform
      Rails.logger.info "[PointThreeAcres] Updated at #{now} (#{data.length} chars)"
    else
      Rails.logger.error "[PointThreeAcres] Failed to update at #{now} (#{data.length} chars)"
    end
  end

  def self.merge_case(_previous_case, _row)
    row = _row.with_indifferent_access
    previous_case = _previous_case.with_indifferent_access

    county = _row["county"]

    {
      "id": _row["id"],
      "country":  "us",
      "last_updated": [previous_case["last_updated"], row["last_updated"]].compact.max,
      "started_at": [previous_case["started_at"], row["started_at"]].compact.min,
      "confirmed_at": [previous_case["confirmed_at"], row["confirmed_at"]].compact.min,
      "recovered_at": [previous_case["recovered_at"], row["recovered_at"]].compact.min,
      "object": "infection",
      "sources": ((previous_case["sources"] || []) + (row["sources"] || [])).compact.uniq.map(&:strip).reject { |a| a.include?("localhost") },
      "province": _row["province"],
      "state": _row["state"],
      "county": county,
      "label": _row["label"],
      "latitude": county.point.y,
      "longitude": county.point.x,
      "infections": {
        "confirm": previous_case["infections"]["confirm"] + row["infections"]["confirm"],
        "recover": previous_case["infections"]["recover"] + row["infections"]["recover"],
        "dead": previous_case["infections"]["dead"] + row["infections"]["dead"]
      }
    }
  end

  def self.fetch_cases(min_lat: nil, min_long: nil, max_lat: nil, max_long: nil, flatten:true, counties: nil)
    box = nil

    if min_lat && max_lat && min_lat && min_long
      box = RGeo::Cartesian::BoundingBox.create_from_points(
        Map.geo_factory.point(Float(max_long), Float(max_lat)),
        Map.geo_factory.point(Float(min_long), Float(min_lat)),
      ).to_geometry
    end

    data = get_data

    results = data["case"].map do |props|
      row = format_case(props)&.with_indifferent_access
      next if row.nil?
      county = row['county']

      next if county.nil?

      if counties.present?
        next if !counties.include?(county.id)
      elsif box.present?
        next if !county.contains?(box)
      end


      row
    end.compact

    if flatten
      cases = []
      counties = {}

      results.each do |row|
        county = row['county']
        if county
          if previous_case = counties[county.id]
            new_case = merge_case(previous_case, row)

            cases[cases.index(previous_case)] = new_case
            counties[county.id] = new_case
          else
            counties[county.id] = row
            cases << row
          end
        else
          cases << row
        end
      end

      cases
    else
      results
    end
  end
end