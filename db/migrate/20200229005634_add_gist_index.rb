class AddGistIndex < ActiveRecord::Migration[6.0]
  def change
    add_index :regions, :location, using: :gist
  end
end
