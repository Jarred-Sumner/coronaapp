class UserReportsController < ApplicationController

  def user_report_json(report)
    {
      id: "user_reports/#{report.id}",
      "country_code":  report.country_code,
      "country": nil,
      "last_updated": report.created_at,
      "province":  nil,
      label: nil,
      "latitude": report.location.x,
      "longitude": report.location.y,
      "infections": {
        'self_report': 1,
        'confirm': 0,
        'dead': 0,
        'recover': 0,
      }
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
    report.save

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