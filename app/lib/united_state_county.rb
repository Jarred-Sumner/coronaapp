class UnitedStateCounty
  attr_accessor :name, :id, :polygons
  def initialize(entry, name, id)
    @name = name
    @id = id

    if entry["geometry"]["type"] == "MultiPolygon"
      @polygons = entry["geometry"]["coordinates"].flat_map do |coords|
        points = coords.flatten.in_groups_of(2).map do |coord|
          Geokit::LatLng.new(coord[0], coord[1])
        end

        Geokit::Polygon.new(points)
      end
    else
      points = entry["geometry"]["coordinates"].flatten.in_groups_of(2).map do |coord|
        Geokit::LatLng.new(coord[0], coord[1])
      end

      @polygons = [Geokit::Polygon.new(points)]
    end
  end

  def contains?(box)
    polygons.any? do |state|
      box.contains?(state.centroid) || state.points.any? { |point| box.contains?(point) }
    end
  end

  def as_json
    {name: name}
  end
end