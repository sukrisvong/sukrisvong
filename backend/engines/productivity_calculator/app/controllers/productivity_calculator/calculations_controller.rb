module ProductivityCalculator
  class CalculationsController < ApplicationController
    def create
      start_time = parse_time(params[:start_time])
      scheduled_minutes = params[:hours_scheduled].to_i * 60 + params[:minutes_scheduled].to_i
      productivity = params[:productivity_goal].to_f / 100.0

      return render json: { error: "Invalid start time" }, status: :unprocessable_entity unless start_time
      return render json: { error: "Productivity goal must be greater than 0" }, status: :unprocessable_entity if productivity <= 0

      total_minutes = (scheduled_minutes / productivity).floor
      end_time = start_time + total_minutes * 60

      render json: {
        time_required: format_duration(total_minutes),
        end_time: end_time.strftime("%I:%M %p")
      }
    end

    private

    def parse_time(str)
      return nil if str.blank?
      Time.parse(str)
    rescue ArgumentError
      nil
    end

    def format_duration(minutes)
      h = minutes / 60
      m = minutes % 60
      m > 0 ? "#{h} hours and #{m} minutes" : "#{h} hours"
    end
  end
end
