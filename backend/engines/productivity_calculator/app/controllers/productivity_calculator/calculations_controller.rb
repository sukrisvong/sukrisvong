module ProductivityCalculator
  class CalculationsController < ApplicationController
    def create
      start_time = parse_time(params[:start_time])
      scheduled_minutes = params[:hours_scheduled].to_i * 60 + params[:minutes_scheduled].to_i
      goal = params[:productivity_goal].to_f

      return render json: { error: "Invalid start time" }, status: :unprocessable_entity unless start_time

      end_time = start_time + scheduled_minutes * 60
      time_on_site_minutes = scheduled_minutes

      productivity = goal > 0 ? (time_on_site_minutes.to_f / (goal / 100.0 * scheduled_minutes) * 100).round(1) : nil

      render json: {
        end_time: end_time.strftime("%I:%M %p"),
        time_on_site: format_duration(time_on_site_minutes),
        productivity_percentage: productivity
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
      m > 0 ? "#{h}h #{m}m" : "#{h}h"
    end
  end
end
