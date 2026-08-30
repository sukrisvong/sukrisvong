Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  mount Core::Engine, at: "/api/core"
  mount ProductivityCalculator::Engine, at: "/api/productivity_calculator"
  mount SortingVisualizer::Engine, at: "/api/sorting_visualizer"
end
