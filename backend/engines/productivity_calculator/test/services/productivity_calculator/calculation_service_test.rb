require "test_helper"

module ProductivityCalculator
  class CalculationServiceTest < ActiveSupport::TestCase
    def call(start_time: "09:00", hours: 6, minutes: 0, goal: 85)
      CalculationService.new(
        start_time: start_time,
        hours_scheduled: hours,
        minutes_scheduled: minutes,
        productivity_goal: goal
      ).call
    end

    def service(start_time: "09:00", hours: 6, minutes: 0, goal: 85)
      CalculationService.new(
        start_time: start_time,
        hours_scheduled: hours,
        minutes_scheduled: minutes,
        productivity_goal: goal
      )
    end

    # --- Calculations ---

    test "calculates total time on site correctly" do
      result = call
      assert_equal "7 hours and 3 minutes", result.time_required
    end

    test "calculates end time correctly" do
      result = call
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
      high = call(hours: 6, minutes: 0, goal: 90)
      low  = call(hours: 6, minutes: 0, goal: 70)
      assert parse_minutes(low.time_required) > parse_minutes(high.time_required)
    end

    # --- Validation ---

    test "is successful with valid params" do
      s = service
      s.call
      assert s.success?
      assert_empty s.errors
    end

    test "returns error for invalid start time" do
      s = service(start_time: "not-a-time")
      s.call
      assert_not s.success?
      assert_includes s.errors, "Invalid start time"
    end

    test "returns error when productivity goal is zero" do
      s = service(goal: 0)
      s.call
      assert_not s.success?
      assert_includes s.errors, "Productivity goal must be greater than 0"
    end

    test "returns error when productivity goal is negative" do
      s = service(goal: -10)
      s.call
      assert_not s.success?
      assert_includes s.errors, "Productivity goal must be greater than 0"
    end

    test "can return multiple errors" do
      s = service(start_time: "bad", goal: 0)
      s.call
      assert_equal 2, s.errors.length
    end

    private

    def parse_minutes(duration)
      h = duration.match(/(\d+) hours?/)&.captures&.first.to_i
      m = duration.match(/(\d+) minutes?/)&.captures&.first.to_i
      h * 60 + m
    end
  end
end
