class SneezemapReportWorker
  include Sidekiq::Worker

  def perform
    data = SneezemapReport._fetch_data()

    return if data.blank?

    Rails.cache.write(SneezemapReport::SNEEZEMAPS_DATA_KEY, data)
    Rails.cache.write(SneezemapReport::LAST_FETCHED_DATA_KEY, DateTime.now.iso8601)
  end
end