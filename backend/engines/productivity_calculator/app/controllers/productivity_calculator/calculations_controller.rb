module ProductivityCalculator
  class CalculationsController < ApplicationController
    def create
      service = CalculationService.new(params)
      result = service.call

      if service.success?
        render json: result
      else
        render json: { errors: service.errors }, status: :unprocessable_entity
      end
    end
  end
end
