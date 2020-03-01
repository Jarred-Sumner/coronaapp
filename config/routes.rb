Rails.application.routes.draw do

  post '/api/user_reports', to: 'user_reports#create'
  get '/api/user_reports', to: 'user_reports#index'
  get '/api/stats/user_reports', to: 'user_reports#stats'
  get '/api/tweets', to: 'tweets#index'
  get '/api/stats/totals', to: 'stats#totals'
  get '/api/stats/country', to: 'stats#country'
end
