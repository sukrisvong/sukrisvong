require "rails_helper"

RSpec.describe "Arcade Sessions", type: :request do
  describe "POST /api/arcade/sessions" do
    context "with valid game" do
      it "creates a session and returns seed" do
        post "/api/arcade/sessions", params: { game: "lane_dodger" }, as: :json

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body).to include("session_id", "seed", "game", "expires_at")
        expect(body["game"]).to eq("lane_dodger")
        expect(body["seed"]).to be_a(Integer)
      end

      it "creates a unique session each time" do
        post "/api/arcade/sessions", params: { game: "lane_dodger" }, as: :json
        id1 = response.parsed_body["session_id"]

        post "/api/arcade/sessions", params: { game: "lane_dodger" }, as: :json
        id2 = response.parsed_body["session_id"]

        expect(id1).not_to eq(id2)
      end

      it "stores the session in the database" do
        expect {
          post "/api/arcade/sessions", params: { game: "lane_dodger" }, as: :json
        }.to change(Arcade::GameSession, :count).by(1)
      end
    end

    context "with invalid game" do
      it "returns unprocessable_content" do
        post "/api/arcade/sessions", params: { game: "hacking_game" }, as: :json
        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["error"]).to eq("Unknown game")
      end
    end
  end
end
