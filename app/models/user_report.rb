class UserReport < ApplicationRecord
  validates :device_uid, uniqueness: true, presence: true
  validates :location, presence: true

  belongs_to :geocode_result, optional: true
end
