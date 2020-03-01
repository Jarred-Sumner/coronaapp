class AddGeocodeResultToUserReports < ActiveRecord::Migration[6.0]
  def change
    add_reference :user_reports, :geocode_result, null: true, foreign_key: true, index: true
    add_column :user_reports, :country_code, :string, null: true
  end
end
