require "rails_helper"

RSpec.describe "Arcade Scores", type: :request do
  def build_game_session(game: "lane_dodger")
    Arcade::GameSession.create!(
      session_id: SecureRandom.uuid,
      seed:       42,
      game:       game,
      expires_at: 5.minutes.from_now
    )
  end

  describe "POST /api/arcade/scores" do
    context "with a valid session and matching score" do
      it "accepts when claimed score matches simulation within tolerance" do
        game_session = build_game_session
        server_score = Arcade::LaneDodger::Simulator.run(seed: game_session.seed, inputs: [])

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: server_score,
          player_name:   "Alice",
          theme:         "cyberpunk",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body["score"]).to eq(server_score)
        expect(body["player_name"]).to eq("Alice")
        expect(body["rank"]).to be_a(Integer)
      end

      it "stamps used_at on the session" do
        game_session = build_game_session
        server_score = Arcade::LaneDodger::Simulator.run(seed: game_session.seed, inputs: [])

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: server_score,
          player_name:   "Bob",
          theme:         "medieval",
          inputs:        []
        }, as: :json

        expect(game_session.reload.used_at).not_to be_nil
      end
    end

    context "when score is tampered" do
      it "rejects a claimed score that does not match simulation" do
        game_session = build_game_session
        server_score = Arcade::LaneDodger::Simulator.run(seed: game_session.seed, inputs: [])

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: server_score + 9999,
          player_name:   "Cheater",
          theme:         "cyberpunk",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["error"]).to eq("Score could not be verified")
      end
    end

    context "with invalid session" do
      it "returns error for missing session" do
        post "/api/arcade/scores", params: {
          session_id:    "non-existent",
          claimed_score: 10,
          player_name:   "X",
          theme:         "cyberpunk",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["error"]).to eq("Invalid session")
      end

      it "returns error for already used session" do
        game_session = build_game_session
        game_session.consume!
        server_score = Arcade::LaneDodger::Simulator.run(seed: game_session.seed, inputs: [])

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: server_score,
          player_name:   "Replay",
          theme:         "cyberpunk",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["error"]).to eq("Session already used")
      end

      it "returns error for expired session" do
        game_session = build_game_session
        game_session.update!(expires_at: 1.minute.ago)
        server_score = Arcade::LaneDodger::Simulator.run(seed: game_session.seed, inputs: [])

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: server_score,
          player_name:   "Late",
          theme:         "cyberpunk",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["error"]).to eq("Session expired")
      end
    end

    context "with invalid theme" do
      it "rejects unknown theme" do
        game_session = build_game_session
        server_score = Arcade::LaneDodger::Simulator.run(seed: game_session.seed, inputs: [])

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: server_score,
          player_name:   "X",
          theme:         "neon_disco",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["error"]).to eq("Invalid theme")
      end
    end

    context "with an unrecognized game in session (defensive else branch)" do
      it "returns unprocessable_content when score mismatch" do
        game_session = build_game_session
        game_session.update_columns(game: "mystery_game")

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: 999,
          player_name:   "Hacker",
          theme:         "cyberpunk",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "with invalid player name" do
      it "rejects blank name" do
        game_session = build_game_session
        server_score = Arcade::LaneDodger::Simulator.run(seed: game_session.seed, inputs: [])

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: server_score,
          player_name:   "   ",
          theme:         "cyberpunk",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["error"]).to eq("Player name required")
      end

      it "rejects name over 30 chars" do
        game_session = build_game_session
        server_score = Arcade::LaneDodger::Simulator.run(seed: game_session.seed, inputs: [])

        post "/api/arcade/scores", params: {
          session_id:    game_session.session_id,
          claimed_score: server_score,
          player_name:   "a" * 31,
          theme:         "cyberpunk",
          inputs:        []
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["error"]).to eq("Player name too long")
      end
    end
  end
end
