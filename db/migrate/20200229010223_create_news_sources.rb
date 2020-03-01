class CreateNewsSources < ActiveRecord::Migration[6.0]
  def change
    create_table :news_sources do |t|
      t.string :name, null: false
      t.references :region, null: true, foreign_key: true, index: true
      t.string :twitter
      t.string :facebook
      t.string :website
      t.datetime :last_indexed_at

      t.timestamps
    end

    add_index :news_sources, :website, unique: true
  end
end
