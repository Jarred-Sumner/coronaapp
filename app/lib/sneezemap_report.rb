class SneezemapReport
  URL = "https://l.sneezemap.com/api/v1"
  LAST_FETCHED_DATA_KEY =  "SneezeMaps/LAST_FETCHED_DATA"
  SNEEZEMAPS_DATA_KEY =  "SneezeMaps/DATA"
  def self.last_fetched_data_at
    Rails.cache.fetch(SneezemapReport::LAST_FETCHED_DATA_KEY)
  end

  def self.needs_data_refresh?
    last_fetched_data_at == nil || 15.minutes.ago > last_fetched_data_at
  end

  def self.find(id)
    fetch_data&.find { |row| row["id"] == id }
  end

  def self._fetch_data
    JSON.parse(faraday(URL).get.body).select { |row| row["isSick"] == true }.map do |row|
      row["id"] = String("_s_#{Zlib.crc32(row["id"])}")

      row
    end
  end

  def self.fetch_data
    data = Rails.cache.fetch(SNEEZEMAPS_DATA_KEY) do
      results = self._fetch_data
      if results.present?
        Rails.cache.write(SneezemapReport::LAST_FETCHED_DATA_KEY, DateTime.now.iso8601)
      end

      results
    end

    if needs_data_refresh?
      SneezemapReportWorker.perform_async
    end

    data
  end

  def self.faraday(url)
    Faraday.new(
      url: url,
      headers: {'Content-Type' => 'application/json'}
    )
  end


end