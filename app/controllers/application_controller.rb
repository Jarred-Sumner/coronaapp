class ApplicationController < ActionController::API

  def bounding_box
    return @bounding_box if @bounding_box

    @bounding_box = RGeo::Cartesian::BoundingBox.create_from_points(
      Map.geo_factory.point(Float(params["max_long"]), Float(params["max_lat"])),
      Map.geo_factory.point(Float(params["min_long"]), Float(params["min_lat"])),
    )
  end

end
