class PinsController < ApplicationController

  def confirmed_pins
    pins = Stats.confirmed_pins(min_lat: params[:min_lat], min_long: params[:min_long], max_lat: params[:max_lat], max_long: params[:max_long])
    last_updated = pins.map { |stat| stat[:last_updated] }.max

    json = {pins: pins, object: "pin", source: 'hopkins'}

    if stale?(etag: json.to_s, last_modified: last_updated, public: true)
      render json: json
    end
  end

end