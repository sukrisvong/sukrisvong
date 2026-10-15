Arcade::Engine.routes.draw do
  post "sessions", to: "sessions#create"
  post "scores",   to: "scores#create"
  get  "leaderboard", to: "leaderboard#index"
end
