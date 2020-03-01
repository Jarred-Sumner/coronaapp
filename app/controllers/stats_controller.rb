class StatsController < ApplicationController

  def totals
    render json: Stats.total_data
  end

  def country
    render json: Stats.country_data
  end
end