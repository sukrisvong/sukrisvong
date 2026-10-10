module ProductivityCalculator
  class Calculator
    include Callable

    MINUTES_PER_UNIT = 15
    LUNCH_MINUTES    = 30
    UNIT_BASED_MODE  = "unit_based"
    TIME_BASED_MODE  = "time_based"

    Result = Data.define(:time_required, :end_time)

    attr_reader :errors, :result

    def initialize(
      start_time:,
      mode: TIME_BASED_MODE,
      hours_scheduled: 0,
      minutes_scheduled: 0,
      productivity_goal: 85,
      units: 0,
      include_lunch: false
    )
      @start_time_raw    = start_time
      @mode              = mode.to_s
      @hours_scheduled   = hours_scheduled.to_i
      @minutes_scheduled = minutes_scheduled.to_i
      @productivity_goal = productivity_goal.to_f
      @units             = units.to_i
      @include_lunch     = include_lunch == true || include_lunch.to_s == "true"
      @errors = []
      @result = nil
    end

    def call
      validate
      return self if @errors.any?

      scheduled_minutes = billable_minutes
      total_minutes = (scheduled_minutes / (@productivity_goal / 100.0)).floor
      total_minutes += LUNCH_MINUTES if @include_lunch
      end_time = @start_time + total_minutes * 60

      @result = Result.new(
        time_required: format_duration(total_minutes),
        end_time: end_time.strftime("%I:%M %p")
      )

      self
    end

    def success?
      @errors.empty?
    end

    private

    def billable_minutes
      if @mode == UNIT_BASED_MODE
        @units * MINUTES_PER_UNIT
      else
        @hours_scheduled * 60 + @minutes_scheduled
      end
    end

    def validate
      @start_time = parse_time(@start_time_raw)
      @errors << "Invalid start time" unless @start_time
      @errors << "Productivity goal must be greater than 0" unless @productivity_goal > 0

      if @mode == UNIT_BASED_MODE
        @errors << "Units must be greater than 0" unless @units > 0
      end
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
