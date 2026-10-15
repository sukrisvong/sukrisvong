require "rails_helper"

RSpec.describe Arcade::GameSession, type: :model do
  subject(:session) do
    described_class.new(
      session_id: SecureRandom.uuid,
      seed:       12345,
      game:       "lane_dodger",
      expires_at: 5.minutes.from_now
    )
  end

  describe "validations" do
    it { is_expected.to be_valid }

    it "requires session_id" do
      session.session_id = nil
      expect(session).not_to be_valid
    end

    it "requires unique session_id" do
      session.save!
      dup = session.dup
      dup.session_id = session.session_id
      expect(dup).not_to be_valid
    end

    it "requires seed" do
      session.seed = nil
      expect(session).not_to be_valid
    end

    it "requires game" do
      session.game = nil
      expect(session).not_to be_valid
    end

    it "rejects unknown games" do
      session.game = "unknown_game"
      expect(session).not_to be_valid
    end

    it "requires expires_at" do
      session.expires_at = nil
      expect(session).not_to be_valid
    end
  end

  describe "#expired?" do
    it "returns false for future expiry" do
      expect(session.expired?).to be false
    end

    it "returns true for past expiry" do
      session.expires_at = 1.minute.ago
      expect(session.expired?).to be true
    end
  end

  describe "#used?" do
    it "returns false when used_at is nil" do
      expect(session.used?).to be false
    end

    it "returns true when used_at is set" do
      session.used_at = Time.current
      expect(session.used?).to be true
    end
  end

  describe "#consume!" do
    it "stamps used_at" do
      session.save!
      expect { session.consume! }.to change { session.reload.used_at }.from(nil)
    end
  end

  describe ".valid scope" do
    it "includes unexpired, unused sessions" do
      session.save!
      expect(described_class.valid).to include(session)
    end

    it "excludes expired sessions" do
      session.expires_at = 1.minute.ago
      session.save!
      expect(described_class.valid).not_to include(session)
    end

    it "excludes used sessions" do
      session.save!
      session.consume!
      expect(described_class.valid).not_to include(session)
    end
  end
end
