class GeocodeUserReportWorker
  include Sidekiq::Worker

  def perform(user_report_id)
    user_report = UserReport.find(user_report_id)

    if result = GeocodeResult.search(latitude: user_report.location.x, longitude: user_report.location.y)
      user_report.update!(geocode_result_id: result.id, country_code: result.country_code)
    end
  end
end

