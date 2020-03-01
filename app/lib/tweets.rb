require 'twitter'

class Tweets
  def self.client
    @twitter ||= Twitter::REST::Client.new do |config|
      config.consumer_key        = Rails.application.credentials[:TWITTER_CONSUMER_KEY]
      config.consumer_secret     = Rails.application.credentials[:TWITTER_CONSUMER_SECRET]
      config.access_token        = Rails.application.credentials[:TWITTER_ACCESS_TOKEN]
      config.access_token_secret = Rails.application.credentials[:TWITTER_ACCESS_SECRET]
    end
  end

  def self.tweets(offset: 0, limit: 100)
    client.user_timeline("AppCorona", {tweet_mode: "extended"})
  end

end