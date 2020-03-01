class PinsController < ApplicationController

  def confirmed_pins
    pins = Stats.confirmed_pins(min_lat: params[:min_lat], min_long: params[:min_long], max_lat: params[:max_lat], max_long: params[:max_long])

    render json: {pins: pins, object: "pin", source: 'hopkins'}
  end

end