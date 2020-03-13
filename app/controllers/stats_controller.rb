class StatsController < ApplicationController

  def totals
    stats = Stats.total_data
    last_updated = stats.map { |stat| stat[:updated_at] }.max

    expires_in 1.minute, public: true, stale_while_revalidate: 15.minutes, stale_if_error: 3.hours

    if stale?(etag: stats.to_json, last_modified: last_updated, public: true)
      render json: stats
    end
  end

  def all_stats
    pins = []
    us = false
    if inside_united_states?
      us = true
      pins = PointThreeAcres.fetch_cases(min_lat: Float(params[:min_lat]), min_long: Float(params[:min_long]), max_lat: Float(params[:max_lat]), max_long: Float(params[:max_long]), flatten: false)
    else
    end

    counties = {}
    ongoing_cases = 0
    total_died = 0
    total_cases = 0
    total_recovered = 0

    pins.each do |pin|
      confirmed = pin.dig("infections", "confirm")
      recover = pin.dig("infections", "recover")
      dead = pin.dig("infections", "dead")
      total_died = total_died + dead
      total_recovered  = total_recovered + recover
      total_cases = total_cases + confirmed

      ongoing_cases = ongoing_cases + [(confirmed - recover - dead), 0].max

      if county = pin[:county]
        if !counties[county.id]
          counties[county.id] = {
            county: county,
            totals: {
              ongoing: 0,
              cumulative: 0,
              recover: 0,
              dead: 0,
            },
            daily: {},
          }
        end

        confirmed = pin.dig("infections", "confirm")
        recover = pin.dig("infections", "recover")
        dead = pin.dig("infections", "dead")
        ongoing = confirmed - recover - dead

        totals = counties[county.id][:totals]
        totals[:cumulative] = confirmed + totals[:cumulative]
        totals[:ongoing] = ongoing + totals[:ongoing]
        totals[:recover] = recover + totals[:recover]
        totals[:dead] = confirmed + totals[:dead]


        confirmed_at = pin["confirmed_at"]
        updated_at = pin["last_updated"]
        base_date_off_of = [confirmed_at, updated_at].compact.first

        date_string = base_date_off_of.strftime("%B %d, %Y").to_sym
        if !counties[county.id][:daily][date_string]
          counties[county.id][:daily][date_string] = {
            ongoing: 0,
            cumulative: 0,
            recover: 0,
            dead: 0,
          }
        end

        daily = counties[county.id][:daily][date_string]
        daily[:ongoing] = daily[:ongoing] + ongoing
        daily[:cumulative] = daily[:cumulative] + confirmed
        daily[:recover] = daily[:recover] + recover
        daily[:dead] = daily[:dead] + dead
      end
    end

    totals = {
      cumulative: total_cases,
      ongoing: ongoing_cases,
      recover: total_recovered,
      dead: total_died,
    }

    render json: {
      object: 'stats',
      us: us,
      totals: totals,
      counties: counties,
    }
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