require "rails_helper"

RSpec.describe Arcade::Score, type: :model do
  let(:game_session) do
    Arcade::GameSession.create!(
      session_id: SecureRandom.uuid,
      seed:       12345,
      game:       "lane_dodger",
      expires_at: 5.minutes.from_now
    )
  end

  subject(:score) do
    described_class.new(
      session_id:  game_session.session_id,
      player_name: "TestPlayer",
      score:       100,
      game:        "lane_dodger",
      theme:       "cyberpunk"
    )
  end

  describe "validations" do
    it { is_expected.to be_valid }

    it "requires player_name" do
      score.player_name = nil
      expect(score).not_to be_valid
    end

    it "enforces player_name max length of 30" do
      score.player_name = "a" * 31
      expect(score).not_to be_valid
    end

    it "allows player_name of exactly 30 chars" do
      score.player_name = "a" * 30
      expect(score).to be_valid
    end

    it "requires score" do
      score.score = nil
      expect(score).not_to be_valid
    end

    it "requires non-negative score" do
      score.score = -1
      expect(score).not_to be_valid
    end

    it "allows zero score" do
      score.score = 0
      expect(score).to be_valid
    end

    it "requires game" do
      score.game = nil
      expect(score).not_to be_valid
    end

    it "rejects unknown games" do
      score.game = "unknown"
      expect(score).not_to be_valid
    end

    it "requires theme" do
      score.theme = nil
      expect(score).not_to be_valid
    end
  end

  describe "#rank" do
    it "returns 1 when no higher scores exist" do
      score.save!
      expect(score.rank).to eq(1)
    end

    it "returns correct rank when higher scores exist" do
      score.save!

      higher = described_class.create!(
        session_id:  SecureRandom.uuid,
        player_name: "Top",
        score:       999,
        game:        "lane_dodger",
        theme:       "cyberpunk"
      )
      expect(score.reload.rank).to eq(2)
      expect(higher.rank).to eq(1)
    end
  end

  describe ".for_game" do
    it "filters by game" do
      score.save!
      expect(described_class.for_game("lane_dodger")).to include(score)
    end
  end

  describe ".top" do
    it "returns scores ordered by score desc" do
      score.update!(score: 50)
      score.save!
      high = described_class.create!(
        session_id:  SecureRandom.uuid,
        player_name: "High",
        score:       200,
        game:        "lane_dodger",
        theme:       "cyberpunk"
      )
      result = described_class.for_game("lane_dodger").top(10)
      expect(result.first).to eq(high)
    end
  end
end
