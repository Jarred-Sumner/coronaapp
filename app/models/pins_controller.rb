class PinsController < ApplicationController

  def confirmed_pins
    pins = Stats.confirmed_pins(min_lat: params[:min_lat], min_long: params[:min_long], max_lat: params[:max_lat], max_long: params[:max_long])
    last_updated = pins.map { |stat| stat[:last_updated] }.max

    states = Map.find_states(bounding_box)
    counties = Map.find_counties(bounding_box)

    json = {pins: pins, object: "pin", source: 'hopkins', states: states.map(&:name), counties: counties.map(&:name) }

    expires_in 1.minute, public: true, stale_while_revalidate: 15.minutes, stale_if_error: 3.hours

    if stale?(etag: json.to_s, last_modified: last_updated, public: true)
      render json: json
    end
  end

end