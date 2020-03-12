class UnitedState
  attr_accessor :name, :id, :polygons, :geojson

  def counties
    Map.counties_in_state(id)
  end

  def factory
    Map.geo_factory
  end

  def initialize(geojson, name, id)
    @name = name
    @id = id
    @geojson = geojson

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
    polygons.any? { |state| box.overlaps?(state) }
  end

  def geokit_contains?(box)
    polygons.any? { |state| box.contains?(state.centroid) }
  end

  def as_json
    {name: name}
  end
end