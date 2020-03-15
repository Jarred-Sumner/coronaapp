require 'pathname'

namespace :geo do
  task :county_boxes => :environment do
    json = Map
      .us_county_bounds
      .group_by { |k, v| v.state_id }
      .map do |group, values|
        [
          group,
          values
            .map { |key, value| [key, value.geojson.geometry] }
            .map do |key, geo|
              [
                key,
                geo.coordinates
              ]
            end.to_h
        ]
      end.to_h

    json.each do |id, value|
      path = Pathname.new(Rails.root.join("frontend/data/us-county-boxes.#{id}.json")).cleanpath
      puts "Writing to #{path}"
      File.write(path, value.to_json)
    end
  end

  task :county_names => :environment do
    json = Map
      .us_county_bounds
      .map { |key, value| [key, {name: value.name, id: key, state_id: value.state_id}] }
      .to_h.to_json


    path = Pathname.new(Rails.root.join("frontend/data/us-county-names.json")).cleanpath

    puts "Writing to #{path}"
    File.write(path, json)
  end

  task :state_bounds => :environment do
    json = Map
      .us_states_bounds
      .map do |key, value|
        box = RGeo::Cartesian::BoundingBox.create_from_geometry(value.geojson.geometry)

        [
          key,
          [
            [box.max_x.round(10),
              box.max_y.round(10)],
            [box.min_y.round(10),
            box.min_x.round(10)],
          ]
        ]
      end
      .to_h.to_json


    path = Pathname.new(Rails.root.join("frontend/data/us-state-bounds.json")).cleanpath

    puts "Writing to #{path}"
    File.write(path, json)
  end


  task :state_names => :environment do
    json = Map
      .us_states_bounds
      .map { |key, value| [key, value.name] }
      .to_h.to_json


    path = Pathname.new(Rails.root.join("frontend/data/us-state-names.json")).cleanpath

    puts "Writing to #{path}"
    File.write(path, json)
  end

  task :all => :environment do
    Rake::Task["geo:county_boxes"].invoke
    Rake::Task["geo:county_names"].invoke
    Rake::Task["geo:state_bounds"].invoke
    Rake::Task["geo:state_names"].invoke
  end
end
