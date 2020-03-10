class AddTimezoneAndLocaleToGeocodeResults < ActiveRecord::Migration[6.0]
  def change
    add_column :geocode_results, :timezone, :string
    add_column :geocode_results, :locale, :string
  end
end
