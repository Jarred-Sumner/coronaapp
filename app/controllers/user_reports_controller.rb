class UserReportsController < ApplicationController

  def user_report_json(report)
    {
      id: report.hashid,
      "country_code":  report.country_code,
      "country": nil,
      "last_updated": report.created_at,
      "province":  nil,
      label: nil,
      "latitude": report.location.y,
      "longitude": report.location.x,
      "infections": {
        'self_report': 1,
        'confirm': 0,
        'dead': 0,
        'recover': 0,
      }
    }
  end


  def report_item_json(report)
    {
      id: report.hashid,
      created_at: report.created_at,
      symptoms: report.symptoms,
      latitude: report.location.y,
      traveled_recently: report.traveled_recently?,
      longitude: report.location.x,
      object: "user_report",
      location: report.geocode_result&.as_json
    }.with_indifferent_access
  end

  def list
    offset = Integer(params[:offset] || 0)
    reports = []
    count = UserReport.order("created_at DESC").count

    UserReport.includes(:geocode_result).where("location IS NOT NULL").order("created_at DESC").find_each do |report|
      reports.push(report_item_json(report))
    end


    min_lat = params[:min_lat]
    min_long = params[:min_long]
    max_lat = params[:max_lat]
    max_long = params[:max_long]
    has_coords = min_lat && min_long && max_lat && max_long

    confirmed_pins = Stats.confirmed_pins(min_lat: min_lat, min_long: min_long, max_lat: max_lat, max_long: max_long)
    confirmed_pins.each do |pin|
      reports.push(pin.with_indifferent_access)
    end

    sorted = false

    if has_coords
      # zoomed_in = Geocoder::Calculations.distance_between([min_lat,  min_long], [max_lat, max_long]).abs < 200
      lat = params[:lat]
      lng = params[:long]
      # if zoomed_in
      reports = reports.sort_by { |report| Geocoder::Calculations.distance_between([lat,  lng], [report["latitude"], report["longitude"]]).abs }
      sorted = true
      # end
    end

    if !sorted
      reports = reports.sort_by { |report| report["last_updated"] || report["created_at"] }.reverse!
    end




    render json: {
      data: reports,
      count: count,
      offset: offset,
    }
  end

  def index
    json = []
    UserReport.select([:id, :country_code, :created_at, :location]).find_each { |report| json << user_report_json(report) }
    render json: {
      pins: json,
      object: 'pin',
      source: 'corona'
    }
  end

  def show
    report = UserReport.includes(:geocode_result).find(params[:id])
    render json: {
      data: report_item_json(report),
      object: "user_report"
    }
  end

  def stats
    last_report_date = UserReport.where("country_code IS NOT null")&.last&.created_at
    countries = UserReport.group(:country_code).where("country_code IS NOT null").count
    countries[:World] = UserReport.where("country_code IS NOT null").count
    render json: {
      last_updated: last_report_date,
      interval: {
        week: countries,
        month: countries,
        year: countries,
        day: countries,
      },
      object: "user_report_stats",
      delta: {
        week: countries,
        month: countries,
        year: countries,
        day: countries,
      }
    }
  end

  def create
    report = UserReport.where(device_uid: create_params[:device_uid]).first_or_initialize
    report.location = "POINT(#{create_params[:latitude]} #{create_params[:longitude]})"
    report.symptoms = String(create_params[:symptoms]).split(",")
    report.traveled_recently = String(create_params[:traveled_recently]) == "true"

    manually_update = report.persisted?

    report.save!

    if manually_update
      GeocodeUserReportWorker.perform_async(report.id)
    end

    render json: {success: true}
  end

  private def create_params
    params.require(:user_report).permit(
      :latitude,
      :longitude,
      :location_accuracy,
      :device_uid,
      :ip_address,
      :traveled_recently,
      :symptoms
    )
  end



end