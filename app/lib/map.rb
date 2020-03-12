module Map
  US_STATES_JSON_PATH = Rails.root.join("db/us-states.json")

  def self.geo_factory
    RGeo::Geos.factory
  end

  def self.prefetch!
    Oj.optimize_rails()
    us_states_json
    us_counties_json
    normalize_bounds!
  end

  def self.counties_in_state(id)
    state_counties_mapping[id].map { |county_id| Map.us_county_bounds[county_id] }
  end

  def self.has_normalized?
    @has_normalized == true
  end

  def self.state_counties_mapping
    @state_counties ||= {}
  end

  def self.normalize_bounds!
    mappings = {}
    us_states_bounds.each do |id, value|
      mappings[id] = []
    end

    us_county_bounds.values.each do |county|
      mappings[county.state.id] << county.id
    end


    @state_counties = mappings
    @has_normalized = true
  end

  def self.find_county(name, state)
    if !has_normalized?
      normalize_bounds!
    end

    us_county_bounds.values.find { |county| county.name == name && county.state.name == state}
  end

  def self.find_state(name: nil)
    if !has_normalized?
      normalize_bounds!
    end

    us_states_bounds.values.find { |state| state.name == name }
  end

  def self.us_states_json
    @us_states_json ||= RGeo::GeoJSON.decode(File.read(US_STATES_JSON_PATH), json_parser: :active_support, geo_factory: geo_factory)
  end

  def self.us_states_bounds
    return @us_states_bounds if @us_states_bounds

    @us_states_bounds = {}

    us_states_json.each do |state|
      name = state.properties["NAME"]
      id = String(state.properties["STATE"])

      @us_states_bounds[id] = UnitedState.new(state, name, id)
    end

    @us_states_bounds = @us_states_bounds.with_indifferent_access
  end

  def self.find_states(point)
    if !has_normalized?
      normalize_bounds!
    end

    us_states_bounds.values.select { |value| value.contains?(point) }
  end

  def self.find_counties(point)
    if !has_normalized?
      normalize_bounds!
    end

    us_county_bounds.values.select { |value| value.contains?(point) }
  end

  US_COUNTIES_JSON_PATH = Rails.root.join("db/us-counties.json")
  def self.us_counties_json
    @us_counties_json ||= RGeo::GeoJSON.decode(File.read(US_COUNTIES_JSON_PATH), json_parser: :active_support, geo_factory: geo_factory)
  end

  def self.us_county_bounds
    return @us_county_bounds if @us_county_bounds

    @us_county_bounds = {}

    us_counties_json.each do |state|
      name = state.properties["NAME"]
      id = state.properties["STATE"] + "_" + state.properties["COUNTY"]
      state_id = state.properties["STATE"]


      @us_county_bounds[id] = UnitedStateCounty.new(state, name, id, state_id)
    end

    @us_county_bounds = @us_county_bounds.with_indifferent_access
  end

end