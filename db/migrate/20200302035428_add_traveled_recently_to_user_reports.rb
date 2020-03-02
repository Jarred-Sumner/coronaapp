class AddTraveledRecentlyToUserReports < ActiveRecord::Migration[6.0]
  def change
    add_column :user_reports, :traveled_recently, :boolean, default: false, null: false
  end
end
