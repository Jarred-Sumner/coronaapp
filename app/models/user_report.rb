class UserReport < ApplicationRecord
  validates :device_uid, uniqueness: true, presence: true
  validates :location, presence: true
end
