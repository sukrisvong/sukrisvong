Rails.application.routes.draw do
  mount ProductivityCalculator::Engine => "/productivity_calculator"
end
