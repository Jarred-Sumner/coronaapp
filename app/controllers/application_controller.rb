class ApplicationController < ActionController::API

  def bounding_box
    return @bounding_box if @bounding_box

    @bounding_box = Geokit::Bounds.new(
      Geokit::LatLng.new(Float(params["max_long"]), Float(params["max_lat"])),
      Geokit::LatLng.new(Float(params["min_long"]), Float(params["min_lat"])),
    )
  end
end
