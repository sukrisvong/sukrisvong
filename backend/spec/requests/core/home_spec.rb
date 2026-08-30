require "rails_helper"

RSpec.describe "Core::Home", type: :request do
  describe "GET /api/core" do
    it "returns engine status" do
      get "/api/core"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq("engine" => "core", "status" => "ok")
    end
  end
end
