class GeocodeResult < ApplicationRecord
  def self.search(latitude: nil, longitude: nil)
    result = GeocodeResult.where(location: "POINT(#{latitude} #{longitude})").first_or_initialize

    if !result.persisted?
      if geocoder = Geocoder.search("#{longitude},#{latitude}")&.first
        result.result = geocoder.data
        result.country_code = geocoder.country_code
        result.country = geocoder.country
        result.city = geocoder.city
        result.state = geocoder.state
        result.state_code = geocoder.state_code
        result.postal_code = geocoder.postal_code
        result.address = geocoder.address
        if result.save
        else
          return nil
        end
      end
    end

    result
  end

  def as_json
    {
      country: country,
      city: city,
      state: state,
      country_code: country_code,
    }
  end
end
