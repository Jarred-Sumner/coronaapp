class ConfirmedPinsWorker
  include Sidekiq::Worker

  def perform
    data = Stats.fetch_confirmed_pins_hopkins(min_lat: 0, min_long: 0, max_lat: 0, max_long: 0)

    return if data.blank?

    Rails.cache.write(Stats::CONFIRMED_URL_KEY, data)
    Rails.cache.write(Stats::CONFIRMED_URL_UPDATED_AT_KEY, DateTime.now.iso8601)

    all_confirmed = PinsController._get_confirmed_pins

    Rails.cache.write(Stats::ALL_CONFIRMED_PINS_KEY, all_confirmed)
  end
end