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
    ongoing_cases = 0

    counties = Map.find_counties(bounding_box.to_geometry)
    county_ids = counties.map(&:id)

    if inside_united_states?
      us = true
      pins = PointThreeAcres.fetch_cases(flatten: false, counties: county_ids).sort_by { |pin| pin["order"] }
    end

    # counties = {}

    # pins.each do |pin|
    #   confirmed = pin.dig("infections", "confirm")
    #   recover = pin.dig("infections", "recover")
    #   dead = pin.dig("infections", "dead")
    #   total_died = total_died + dead
    #   total_recovered  = total_recovered + recover
    #   total_cases = total_cases + confirmed

    #   ongoing_cases = ongoing_cases + [(confirmed - recover - dead), 0].max

    #   if county = pin[:county]
    #     if !counties[county.id]
    #       counties[county.id] = {
    #         county: county,
    #         totals: {
    #           ongoing: 0,
    #           cumulative: 0,
    #           recover: 0,
    #           dead: 0,
    #         },
    #         daily: {},
    #       }
    #     end

    #     confirmed = pin.dig("infections", "confirm")
    #     recover = pin.dig("infections", "recover")
    #     dead = pin.dig("infections", "dead")
    #     ongoing = confirmed - recover - dead

    #     totals = counties[county.id][:totals]
    #     totals = {
    #       :cumulative => confirmed + totals[:cumulative],
    #       :ongoing =>  ongoing + totals[:ongoing],
    #       :recover => recover + totals[:recover],
    #       :dead => dead + totals[:dead],
    #     }

    #     counties[county.id][:totals].merge!(totals)

    #     confirmed_at = pin["confirmed_at"]
    #     started_at = pin[""]
    #     updated_at = pin["last_updated"]
    #     base_date_off_of = [confirmed_at, updated_at, started_at].compact.first.beginning_of_day

    #     date_string = base_date_off_of.strftime("%Y-%m-%d")
    #     if !counties[county.id][:daily][date_string]
    #       counties[county.id][:daily][date_string] = {
    #         ongoing: 0,
    #         cumulative: 0,
    #         recover: 0,
    #         dead: 0,
    #       }
    #     end

    #     date_totals = counties[county.id][:daily][date_string]

    #     date_totals.merge!({
    #       ongoing: date_totals[:ongoing] + ongoing,
    #       cumulative: date_totals[:cumulative] + confirmed,
    #       recover: date_totals[:recover] + recover,
    #       dead: date_totals[:dead] + dead,
    #     })

    #   end
    # end


    # counties.each do |id, county|
    #   Rails.logger.info "COUNTY #{county.inspect}\n"
    #   daily = county[:daily].with_indifferent_access
    #   daily_keys = daily.keys.sort

    #   min_date = Date.parse(daily_keys.min)
    #   max_date = Date.parse(daily_keys.max)

    #   last_totals = daily[daily_keys.first]

    #   days_between = (max_date - min_date)
    #   days_between.to_i.times do |offset|
    #     date = min_date + offset.days
    #     _date = date.strftime("%Y-%m-%d")

    #     totals = last_totals

    #     if daily[_date]

    #       _totals = daily[_date]
    #       daily[_date].merge!({
    #         :cumulative => _totals[:cumulative] + totals[:cumulative],
    #         :ongoing =>  _totals[:ongoing] + totals[:ongoing],
    #         :recover => _totals[:recover]  + totals[:recover],
    #         :dead => _totals[:dead] + totals[:dead],
    #       })
    #     end

    #     county[:daily][_date] = totals

    #     last_totals = totals
    #     last_date_key = _date
    #     last_date = date
    #   end

    #   county[:daily] = county[:daily].merge(daily).sort.to_h
    # end

    # totals = {
    #   cumulative: total_cases,
    #   ongoing: total_cases - total_recovered - total_died,
    #   recover: total_recovered,
    #   dead: total_died,
    # }

    render json: {
      object: 'stats',
      us: us,
      logs: pins,
      counties: counties.map { |county| [county.id, county ]}.to_h,
    }
  end

  def us_totals
    totals = PointThreeAcres.us_totals_by_day
    expires_in 15.minutes, public: true, stale_while_revalidate: 30.minutes, stale_if_error: 1.day

    if stale?(etag: totals, public: true)
      render json: totals
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