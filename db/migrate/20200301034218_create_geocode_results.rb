class CreateGeocodeResults < ActiveRecord::Migration[6.0]
  def change
    create_table :geocode_results do |t|
      t.jsonb :result, null: false
      t.st_point :location, geographic: true, null: false
      t.string :country_code
      t.string :country
      t.string :city
      t.string :state
      t.string :state_code
      t.string :postal_code
      t.string :address

      t.timestamps
    end
  end
end
