class UnitedStateCounty
  attr_accessor :name, :id, :polygons, :geojson, :state_id

  def kml_path
    "/kml/county-#{id}.kml"
  end

  def point
    geojson.geometry.centroid
  end

  def state
    Map.us_states_bounds[state_id]
  end

  def factory
    Map.geo_factory
  end

  def initialize(geojson, name, id, state_id)
    @name = name
    @id = id
    @geojson = geojson
    @state_id = state_id

    if geojson.geometry.geometry_type == RGeo::Feature::MultiPolygon
      @polygons = []
      geojson.geometry.each do |geometry|
        @polygons << geometry
      end
    else
      @polygons = [geojson.geometry]
    end
  end

  def contains?(box)
    polygons.any? { |state| box.intersects?(state) }
  end

  def geokit_contains?(box)
    polygons.any? { |state| box.contains?(state.centroid) }
  end

  def as_json(_ = nil)
    {name: name, id: id, state_id: state_id}
  end
end