class RootController < ActionController::Base
  include ActionView::Helpers::NumberHelper

  def index
    if coordinates.present?
      render_meta_tags
    else
      render file: 'public/_index.html'
    end
  end

  def report_sick
    render file: 'public/report_sick.html'
  end

  def stats
    render file: 'public/stats.html'
  end

  def country
    render file: 'public/country.html'
  end

  def meta_tags
    doc = File.read(Rails.root + 'public/_index.html')

    share_image_url = Addressable::URI.parse("https://i.covy.app/")
    share_image_url.query_values = coordinates.merge({
      width: 1200,
      height: 630,
    })

    bounds = Geokit::Bounds.new(
      Geokit::LatLng.new(coordinates[:maxLat],coordinates[:maxLon]),
      Geokit::LatLng.new(coordinates[:minLat],coordinates[:minLon]),
    )

    # pins = Stats.confirmed_pins(
    #   min_lat: coordinates[:minLat],
    #   min_long: coordinates[:minLng],
    #   max_lat: coordinates[:maxLat],
    #   max_long: coordinates[:maxLng]
    # ).select do |report|

    #   bounds.contains?(Geokit::LatLng.new(report[:latitude],report[:longitude]))
    # end


    # confirm = pins.sum { |pin| pin.dig(:infections, :confirm) || 0}
    # dead = pins.sum { |pin| pin.dig(:infections, :dead) || 0 }
    # recover = pins.sum { |pin| pin.dig(:infection, :recover) || 0 }
    # count = confirm - dead - recover
    count = 0

    tags = [
      '<meta ssr property="og:image:width" content="1200" />',
      '<meta ssr property="og:image:height" content="630" />',
      '<meta ssr property="og:image:type" content="image/png" />',
      '<meta ssr property="twitter:card" content="summary_large_image" />',
      "<meta ssr property=\"og:image:url\" content=\"#{share_image_url.to_s}\" />",
      "<meta ssr property=\"twitter:image\" content=\"#{share_image_url.to_s}\" />",
    ]

    title_label = "Covy | Real-time Corona Virus Map"
    description = "Covy is the easiest way to track the spread of the novel Coronavirus (COVID-19)."
    if count > 0
      title_label = "Track #{number_with_delimiter(count)}+ cases of Coronavirus | Covy - Real-Time Coronavirus Map"
    end

    tags << "<meta ssr name=\"description\" content=\"#{description}\" />"
    tags << "<meta ssr property=\"og:description\" content=\"#{description}\" />"
    tags << "<meta ssr name=\"twitter:description\" content=\"#{description}\" />"

    tags << "<meta ssr property=\"og:title\" content=\"#{title_label}\" />"
    tags << "<title ssr>#{title_label}</title>"
    tags << "<meta ssr name=\"twitter:title\" content=\"#{title_label}\" />"


    doc.sub("<head>", "<head>#{tags.join("\n")}")
  end

  def render_meta_tags
    @html = meta_tags
    render action: 'index', layout: nil, content_type: "text/html"
  end

  private def coordinates
    return @coordinates if @coordinates
    return nil if params[:dlat].blank? || params[:lat].blank? || params[:lng].blank? || params[:a].blank? || params[:dlng].blank?

    dlat =  Float(params[:dlat]).abs
    dlng =  Float(params[:dlng]).abs
    altitude =  Float(params[:a])
    latitude = Float(params[:lat])
    longitude = Float(params[:lng])
    min_latitude = latitude - dlat
    min_longitude = latitude - dlng
    max_latitude = latitude + dlat
    max_longitude = longitude + dlng

    @coordinates = {
      lat: latitude,
      lon: longitude,
      minLat: max_latitude,
      minLon: max_longitude,
      maxLat: min_latitude,
      maxLon: min_longitude,
      a: altitude,
    }
  end
end