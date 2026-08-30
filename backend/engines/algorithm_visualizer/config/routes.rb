AlgorithmVisualizer::Engine.routes.draw do
  resources :algorithms, only: [:index] do
    post :run, on: :member
  end
  resources :runs, only: [:create]
end
