class UrlPreview
  IMAGE_PREVIEW_URL = "https://scraper-omega.now.sh/api"

  def self.faraday
    Faraday.new(
      url: IMAGE_PREVIEW_URL,
      headers: {'Content-Type' => 'application/json'}
    )
  end

  def self.preview(url)
    resp = JSON.parse(faraday.get("?url=#{CGI.escape(url)}").body).with_indifferent_access

    if resp[:data].present?
      resp[:data]
    else
      nil
    end
  end


end