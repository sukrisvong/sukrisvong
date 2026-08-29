module ProductivityCalculator
  class CalculationsController < ApplicationController
    def create
      calculator = Calculator.call(params)

      if calculator.success?
        render json: calculator.result
      else
        render json: { errors: calculator.errors }, status: :unprocessable_entity
      end
    end
  end
end
