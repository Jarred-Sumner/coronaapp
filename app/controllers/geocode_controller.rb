class GeocodeController < ApplicationController

  def show
    lat = Float(params[:latitude])
    long =  Float(params[:longitude])

    if lat.nil?
      render json: nil, status: 400
      return
    end

    if long.nil?
      render json: nil, status: 400
      return
    end

    result = GeocodeResult.search(latitude: lat, longitude: long)

    if result.present?
      expires_in 1.month, public: true, stale_while_revalidate: 1.month, stale_if_error: 1.month

      if stale?(etag: result, last_modified: result.updated_at, public: true)
        render json: result
      end
    else
      render json: nil, status: 400
    end
  end
end
