class Map
  US_STATES_JSON_PATH = Rails.root.join("db/us-states.json")

  def self.geo_factory
    RGeo::Geographic.simple_mercator_factory
  end

  def self.us_states_json
    # @us_states_json ||= RGeo::GeoJSON.decode(File.read(US_STATES_JSON_PATH), json_parser: :active_support, geo_factory: geo_factory)
    @us_states_json ||= ActiveSupport::JSON.decode(File.read(US_STATES_JSON_PATH)).with_indifferent_access
  end

  def self.us_states_bounds
    return @us_states_bounds if @us_states_bounds

    @us_states_bounds = {}


    us_states_json["features"].each do |state|
      name = state[:properties]["NAME"]
      id = state[:properties]["GEO_ID"]

      @us_states_bounds[name] = UnitedState.new(state, name, id)
    end

    @us_states_bounds
  end

  def self.find_states(point)
    us_states_bounds.values.select { |value| value.contains?(point) }
  end

  def self.find_counties(point)
    us_county_bounds.values.select { |value| value.contains?(point) }
  end

  US_COUNTIES_JSON_PATH = Rails.root.join("db/us-counties.json")
  def self.us_counties_json
    @us_counties_json ||= ActiveSupport::JSON.decode(File.read(US_COUNTIES_JSON_PATH)).with_indifferent_access
  end

  def self.us_county_bounds
    return @us_county_bounds if @us_county_bounds

    @us_county_bounds = {}

    us_counties_json["features"].each do |state|
      name = state[:properties]["NAME"]
      id = state[:properties]["GEO_ID"]

      @us_county_bounds[name] = UnitedStateCounty.new(state, name, id)
    end

    @us_county_bounds
  end

end