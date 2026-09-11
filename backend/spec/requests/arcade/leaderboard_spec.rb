require "rails_helper"

RSpec.describe "Arcade Leaderboard", type: :request do
  before do
    Arcade::Score.create!(session_id: SecureRandom.uuid, player_name: "Alice", score: 300, game: "lane_dodger", theme: "cyberpunk")
    Arcade::Score.create!(session_id: SecureRandom.uuid, player_name: "Bob",   score: 150, game: "lane_dodger", theme: "medieval")
    Arcade::Score.create!(session_id: SecureRandom.uuid, player_name: "Carol", score: 500, game: "lane_dodger", theme: "cyberpunk")
  end

  describe "GET /api/arcade/leaderboard" do
    it "returns scores in descending order" do
      get "/api/arcade/leaderboard", params: { game: "lane_dodger" }

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      scores = body.map { |s| s["score"] }
      expect(scores).to eq(scores.sort.reverse)
    end

    it "includes expected fields" do
      get "/api/arcade/leaderboard", params: { game: "lane_dodger" }

      entry = response.parsed_body.first
      expect(entry).to include("rank", "player_name", "score", "theme", "created_at")
    end

    it "assigns sequential ranks starting at 1" do
      get "/api/arcade/leaderboard", params: { game: "lane_dodger" }

      ranks = response.parsed_body.map { |s| s["rank"] }
      expect(ranks).to eq([ 1, 2, 3 ])
    end

    it "defaults to lane_dodger when game param omitted" do
      get "/api/arcade/leaderboard"
      expect(response).to have_http_status(:ok)
    end

    it "returns error for unknown game" do
      get "/api/arcade/leaderboard", params: { game: "nope" }
      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["error"]).to eq("Unknown game")
    end

    it "limits to 10 entries" do
      11.times { |i| Arcade::Score.create!(session_id: SecureRandom.uuid, player_name: "P#{i}", score: i * 10, game: "lane_dodger", theme: "cyberpunk") }
      get "/api/arcade/leaderboard", params: { game: "lane_dodger" }
      expect(response.parsed_body.length).to eq(10)
    end
  end
end
