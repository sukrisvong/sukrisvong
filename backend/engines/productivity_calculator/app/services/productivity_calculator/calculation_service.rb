module ProductivityCalculator
  class CalculationService
    Result = Data.define(:time_required, :end_time)

    def initialize(start_time:, hours_scheduled:, minutes_scheduled:, productivity_goal:)
      @start_time = start_time
      @scheduled_minutes = hours_scheduled.to_i * 60 + minutes_scheduled.to_i
      @productivity = productivity_goal.to_f / 100.0
    end

    def call
      total_minutes = (@scheduled_minutes / @productivity).floor
      end_time = @start_time + total_minutes * 60

      Result.new(
        time_required: format_duration(total_minutes),
        end_time: end_time.strftime("%I:%M %p")
      )
    end

    private

    def format_duration(minutes)
      h = minutes / 60
      m = minutes % 60
      m > 0 ? "#{h} hours and #{m} minutes" : "#{h} hours"
    end
  end
end
