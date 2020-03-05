class StatsController < ApplicationController

  def totals
    stats = Stats.total_data
    last_updated = stats.map { |stat| stat[:updated_at] }.max

    expires_in 1.minute, public: true, stale_while_revalidate: 15.minutes, stale_if_error: 3.hours

    if stale?(etag: stats.to_json, last_modified: last_updated, public: true)
      render json: stats
    end
  end

  def country
    stats = Stats.country_data
    last_updated = stats.map { |stat| stat[:updated_at] }.max

    expires_in 1.minute, public: true, stale_while_revalidate: 15.minutes, stale_if_error: 3.hours

    if stale?(etag: stats.to_json, last_modified: last_updated, public: true)
      render json: stats
    end
  end
end