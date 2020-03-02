# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

# "Latitude": 37.26984,
# "Longitude": -81.22232,
# "Accuracy Score": 1,
# "Accuracy Type": "place",
# "Number": null,
# "Street": null,
# "City_2": "Bluefield",
# "State": "WV",
# "County": "Mercer County",
# "Zip": 24701,

if Region.count.zero?
  regions = JSON.parse(File.read("#{Rails.root}/db/seed/demographics.json"))

  regions.each do |_row|
    row = _row.with_indifferent_access
    Region.create!({
      city: row["City_2"],
      state: row["State"],
      zip: row["Zip"],
      county: row["State"],
      location: "POINT(#{row["Longitude"]} #{row["Latitude"]})",
    })
  end
end

news = JSON.parse(File.read("#{Rails.root}/db/seed/all.json")).with_indifferent_access

all_regions = Region.all_names
news.each do |region_name, sources|
  region = all_regions[region_name]
  raise "#{region_name} broken  " if region.blank? && sources.count > 0

  sources.each do |source|
    site = source["website"]
    next if NewsSource.where(website: site).exists?
    NewsSource.create!(
      region: region,
      name: source["name"],
      twitter: source["twitter"],
      facebook: source["facebook"] && source["facebook"].split("facebook.com/").last,
      website: site
    )
  end
end

