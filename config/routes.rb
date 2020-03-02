Rails.application.routes.draw do

  post '/api/user_reports', to: 'user_reports#create'

  get '/api/user_reports', to: 'user_reports#index'
  get '/api/stats/user_reports', to: 'user_reports#stats'
  get '/api/user_reports/list', to: 'user_reports#list'
  get '/api/tweets', to: 'tweets#index'
  get '/api/reports', to: 'pins#confirmed_pins'
  get '/api/stats/totals', to: 'stats#totals'
  get '/api/stats/country', to: 'stats#country'
  get '/api/user_reports/:id', to: 'user_reports#show'
end
