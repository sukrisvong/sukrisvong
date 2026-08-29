module ProductivityCalculator
  class CalculationsController < ApplicationController
    def create
      calculator = Calculator.call(**calculator_params)

      return render json: { errors: calculator.errors }, status: :unprocessable_entity unless calculator.success?

      render json: calculator.result
    end

    private

    def calculator_params
      params.permit(:start_time, :hours_scheduled, :minutes_scheduled, :productivity_goal).to_h.symbolize_keys
    end
  end
end
