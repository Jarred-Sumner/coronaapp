namespace :postrelease do
  desc 'Check if RGeo supports GEOS'
  task :rgeo_supports_geos do
    abort 'Error: RGeo does not support GEOS.' unless RGeo::Geos.supported?
  end
end
