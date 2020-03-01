class CreateUserReports < ActiveRecord::Migration[6.0]
  def change
    create_table :user_reports do |t|
      t.string :device_uid, null: false
      t.st_point :location, geographic: true, null: false
      t.string :symptoms, array: true, default: [], null: false

      t.timestamps
    end
    add_index :user_reports, :device_uid
  end
end
