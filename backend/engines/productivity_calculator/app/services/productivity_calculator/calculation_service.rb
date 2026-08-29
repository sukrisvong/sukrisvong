module ProductivityCalculator
  class CalculationService
    Result = Data.define(:time_required, :end_time)

    attr_reader :errors

    def initialize(params)
      @start_time_raw   = params[:start_time]
      @hours_scheduled  = params[:hours_scheduled].to_i
      @minutes_scheduled = params[:minutes_scheduled].to_i
      @productivity_goal = params[:productivity_goal].to_f
      @errors = []
    end

    def call
      validate
      return self if @errors.any?

      scheduled_minutes = @hours_scheduled * 60 + @minutes_scheduled
      total_minutes = (scheduled_minutes / (@productivity_goal / 100.0)).floor
      end_time = @start_time + total_minutes * 60

      Result.new(
        time_required: format_duration(total_minutes),
        end_time: end_time.strftime("%I:%M %p")
      )
    end

    def success?
      @errors.empty?
    end

    private

    def validate
      @start_time = parse_time(@start_time_raw)
      @errors << "Invalid start time" unless @start_time
      @errors << "Productivity goal must be greater than 0" unless @productivity_goal > 0
    end

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
