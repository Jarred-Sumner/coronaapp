desc "Send appointment reminders"
task :scrape => :environment do # :environment will load our Rails app, so we can query the database with ActiveRecord
  PointThreeAcres.update_fetched_cases
end