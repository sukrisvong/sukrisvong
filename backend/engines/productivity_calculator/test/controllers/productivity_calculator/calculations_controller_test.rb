require "test_helper"

module ProductivityCalculator
  class CalculationsControllerTest < ActionDispatch::IntegrationTest
    def post_calculate(params)
      post productivity_calculator.calculate_path,
        params: params.to_json,
        headers: { "Content-Type" => "application/json" }
    end

    test "returns time_required and end_time on valid input" do
      post_calculate(start_time: "09:00", hours_scheduled: 6, minutes_scheduled: 0, productivity_goal: 85)

      assert_response :success
      body = JSON.parse(response.body)
      assert body.key?("time_required")
      assert body.key?("end_time")
    end

    test "returns 422 for invalid start time" do
      post_calculate(start_time: "not-a-time", hours_scheduled: 6, minutes_scheduled: 0, productivity_goal: 85)
      assert_response :unprocessable_entity
    end

    test "returns 422 when productivity goal is zero" do
      post_calculate(start_time: "09:00", hours_scheduled: 6, minutes_scheduled: 0, productivity_goal: 0)
      assert_response :unprocessable_entity
    end

    test "returns 422 when productivity goal is negative" do
      post_calculate(start_time: "09:00", hours_scheduled: 6, minutes_scheduled: 0, productivity_goal: -10)
      assert_response :unprocessable_entity
    end
  end
end
