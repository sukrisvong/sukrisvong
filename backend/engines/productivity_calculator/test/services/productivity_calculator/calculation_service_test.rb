require "test_helper"

module ProductivityCalculator
  class CalculationServiceTest < ActiveSupport::TestCase
    def call(hours: 6, minutes: 0, goal: 85)
      CalculationService.new(
        start_time: Time.parse("09:00"),
        hours_scheduled: hours,
        minutes_scheduled: minutes,
        productivity_goal: goal
      ).call
    end

    test "calculates total time on site correctly" do
      result = call(hours: 6, minutes: 0, goal: 85)
      assert_equal "7 hours and 3 minutes", result.time_required
    end

    test "calculates end time correctly" do
      result = call(hours: 6, minutes: 0, goal: 85)
      assert_equal "04:03 PM", result.end_time
    end

    test "formats duration without minutes when evenly divisible" do
      result = call(hours: 8, minutes: 0, goal: 100)
      assert_equal "8 hours", result.time_required
    end

    test "accounts for scheduled minutes" do
      result = call(hours: 5, minutes: 30, goal: 100)
      assert_equal "5 hours and 30 minutes", result.time_required
    end

    test "100% productivity means time on site equals scheduled time" do
      result = call(hours: 6, minutes: 0, goal: 100)
      assert_equal "6 hours", result.time_required
    end

    test "lower productivity means more time on site" do
      result_high = call(hours: 6, minutes: 0, goal: 90)
      result_low  = call(hours: 6, minutes: 0, goal: 70)

      high_minutes = parse_minutes(result_high.time_required)
      low_minutes  = parse_minutes(result_low.time_required)

      assert low_minutes > high_minutes
    end

    private

    def parse_minutes(duration)
      h = duration.match(/(\d+) hours?/)&.captures&.first.to_i
      m = duration.match(/(\d+) minutes?/)&.captures&.first.to_i
      h * 60 + m
    end
  end
end
