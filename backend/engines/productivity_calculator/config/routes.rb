ProductivityCalculator::Engine.routes.draw do
  post "/calculate", to: "calculations#create"
end
