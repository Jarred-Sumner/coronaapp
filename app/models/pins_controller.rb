class PinsController < ApplicationController

  def kml
    plot = PointThreeAcres.fetch_case_by_id(params[:id])

    if plot.nil?
      render status: 404
      return
    end

    county = plot.county

    render text: county.kml, content_type: "application/vnd.google-earth.kml+xml"
  end

  def self._get_confirmed_pins
    pins = Stats.confirmed_pins(min_lat: nil, min_long: nil, max_lat: nil, max_long: nil)
    {pins: pins, object: "pin" }.to_json
  end

  def self.get_confirmed_pins
    Rails.cache.fetch(Stats::ALL_CONFIRMED_PINS_KEY) do
      PinsController._get_confirmed_pins
    end
  end

  def confirmed_pins
    json = PinsController.get_confirmed_pins

    expires_in 1.minute, public: true, stale_while_revalidate: 15.minutes, stale_if_error: 3.hours

    if stale?(etag: json, public: true)
      render json: json
    end
  end

end