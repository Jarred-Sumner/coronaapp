class ApplicationController < ActionController::API

  def inside_united_states?
    lat = params[:latitude]
    lng = params[:longitude]

    if lat && lng
      return Map.bounding_box_inside_united_states?(bounding_box.to_geometry)
    else
      return false
    end
  end


  def bounding_box
    return @bounding_box if @bounding_box

    @bounding_box = RGeo::Cartesian::BoundingBox.create_from_points(
      Map.geo_factory.point(Float(params["max_long"]), Float(params["max_lat"])),
      Map.geo_factory.point(Float(params["min_long"]), Float(params["min_lat"])),
    )
  end

end
