class TweetsController < ApplicationController

  def normalized_tweet_text(text)
    if match = text.match(/^RT \@.*\:\s/)
      normalized_tweet_text(text[match[0].length..-1])
    else
      remove_uris(text)&.strip
    end
  end


  def remove_uris(text)
    text.gsub(/#{URI::regexp}/, '')
  end

  def render_tweet(tweet)
    username = tweet.attrs.dig(:retweeted_status, :user, :screen_name) || tweet.user.screen_name
    tweet_url = tweet.url.to_s
    url = tweet.attrs.dig(:entities, :expanded_url) || tweet.attrs.dig(:retweeted_status, :entities, :expanded_url) || tweet.attrs.dig(:retweeted_status, :entities, :urls)&.first&.dig(:expanded_url) || tweet_url
    url_preview = url != tweet_url && url.present? ? UrlPreview.preview(url) : nil
    {
      "id": tweet.id,
      "timestamp": tweet.created_at,
      "photo_url": tweet&.retweeted_status&.user&.profile_image_url&.to_s || tweet&.user&.profile_image_url&.to_s,
      "username": username,
      "tweet_url": tweet_url,
      "object": "tweet",
      "text": normalized_tweet_text(tweet.full_text),
      "media": tweet.attrs.dig(:entities, :media) || tweet.attrs.dig(:retweeted_status, :entities, :media),
      "url": url,
      "url_preview": url_preview
    }
  end

  def index
    offset = Integer(params[:offset] || 0)
    limit = Integer(params[:limit] || 100)

    tweets = Tweets.tweets(offset: offset, limit: limit).map { |tweet| render_tweet(tweet) }

    render json: {
      data: tweets,
      count: tweets.length,
      offset: offset,
      limit: limit,
      social_profiles: {
        twitter: "@jarredsumner"
      }
    }
  end

end