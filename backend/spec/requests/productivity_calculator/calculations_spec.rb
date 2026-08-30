require "rails_helper"

RSpec.describe "ProductivityCalculator::Calculations", type: :request do
  def post_calculate(params)
    post "/api/productivity_calculator/calculate",
      params: params.to_json,
      headers: { "Content-Type" => "application/json" }
  end

  describe "POST /api/productivity_calculator/calculate" do
    context "with valid input" do
      before { post_calculate(start_time: "09:00", hours_scheduled: 6, minutes_scheduled: 0, productivity_goal: 85) }

      it { expect(response).to have_http_status(:ok) }

      it "returns time_required and end_time" do
        body = JSON.parse(response.body)
        expect(body).to include("time_required", "end_time")
      end
    end

    context "with invalid input" do
      before { post_calculate(start_time: "not-a-time", hours_scheduled: 6, minutes_scheduled: 0, productivity_goal: 0) }

      it { expect(response).to have_http_status(:unprocessable_entity) }

      it "returns an errors array" do
        body = JSON.parse(response.body)
        expect(body["errors"]).to be_an(Array).and be_present
      end
    end
  end
end
