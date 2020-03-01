class CreateRegions < ActiveRecord::Migration[6.0]
  def change
    create_table :regions do |t|
      t.string :city
      t.string :county
      t.string :zip
      t.string :state
      t.string :slug
      t.st_point :location, geographic: true

      t.timestamps
    end

    add_index :regions, :slug, unique: true
  end
end
