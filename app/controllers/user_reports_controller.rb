class UserReportsController < ApplicationController

  def index
    render json: {
      locations: UserReport.pluck(:location).map { |location| [location.x, location.y] }
    }
  end

  def stats
    render json: {
      sick_count: UserReport.count
    }
  end

  def create
    report = UserReport.where(device_uid: create_params[:device_uid]).first_or_initialize
    report.location = "POINT(#{create_params[:latitude]} #{create_params[:longitude]})"
    report.symptoms = create_params[:symptoms]

    render json: {success: true}
  end

  private def create_params
    params.require(:user_report).permit([
      :latitude,
      :longitude,
      :device_uid,
      :symptoms
    ])
  end



end