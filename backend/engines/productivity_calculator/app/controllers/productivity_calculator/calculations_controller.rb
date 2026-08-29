module ProductivityCalculator
  class CalculationsController < ApplicationController
    def create
      start_time = parse_time(params[:start_time])
      return render json: { error: "Invalid start time" }, status: :unprocessable_entity unless start_time
      return render json: { error: "Productivity goal must be greater than 0" }, status: :unprocessable_entity if params[:productivity_goal].to_f <= 0

      result = CalculationService.new(
        start_time: start_time,
        hours_scheduled: params[:hours_scheduled],
        minutes_scheduled: params[:minutes_scheduled],
        productivity_goal: params[:productivity_goal]
      ).call

      render json: result
    end

    private

    def parse_time(str)
      return nil if str.blank?
      Time.parse(str)
    rescue ArgumentError
      nil
    end
  end
end
