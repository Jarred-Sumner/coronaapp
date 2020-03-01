class Region < ApplicationRecord
  scope :within, -> (latitude, longitude, distance_in_mile = 1) {
    where(%{
     ST_Distance(location, 'POINT(%f %f)') < %d
    } % [longitude, latitude, distance_in_mile * 1609.34]) # approx
  }

  def self.all_names
    Region.all.map do |region|
      ["#{region.city}, #{region.state}", region]
    end.to_h
  end
end
