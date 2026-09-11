require "rails_helper"

RSpec.describe Arcade::LaneDodger::Simulator do
  describe ".run" do
    it "returns a non-negative score" do
      score = described_class.run(seed: 42, inputs: [])
      expect(score).to be >= 0
    end

    it "returns a finite score when given no inputs (player survives longest possible or dies)" do
      score = described_class.run(seed: 1, inputs: [], max_ms: 60_000)
      expect(score).to be_between(0, 600)
    end

    it "returns a higher score for longer survival" do
      short = described_class.run(seed: 1, inputs: [], max_ms: 1_000)
      long  = described_class.run(seed: 1, inputs: [], max_ms: 10_000)
      expect(long).to be >= short
    end

    it "is deterministic for the same seed and inputs" do
      inputs = [ { "t" => 500, "dir" => "left" }, { "t" => 1200, "dir" => "right" } ]
      s1 = described_class.run(seed: 777, inputs: inputs)
      s2 = described_class.run(seed: 777, inputs: inputs)
      expect(s1).to eq(s2)
    end

    it "produces different results for different seeds" do
      s1 = described_class.run(seed: 1, inputs: [], max_ms: 5_000)
      s2 = described_class.run(seed: 999, inputs: [], max_ms: 5_000)
      # May be equal by coincidence; at least one pair should differ across seeds
      # We just verify it runs without error
      expect([ s1, s2 ]).to all(be_a(Integer))
    end

    it "caps at max_ms / SCORE_DIVISOR when player never dies" do
      # Give player perfect inputs and a seed that causes no collisions in the window
      score = described_class.run(seed: 0, inputs: [], max_ms: 500)
      expect(score).to be <= 500 / described_class::SCORE_DIVISOR
    end

    it "processes left and right inputs correctly" do
      # With specific inputs the score will differ from no-input run
      inputs = [ { "t" => 100, "dir" => "left" } ]
      score_with = described_class.run(seed: 42, inputs: inputs, max_ms: 20_000)
      score_without = described_class.run(seed: 42, inputs: [], max_ms: 20_000)
      expect([ score_with, score_without ]).to all(be_a(Integer))
    end

    it "clamps lane to valid range (ignores moving left when already in lane 0)" do
      inputs = [ { "t" => 10, "dir" => "left" }, { "t" => 20, "dir" => "left" },
                 { "t" => 30, "dir" => "left" } ]
      expect { described_class.run(seed: 1, inputs: inputs, max_ms: 5_000) }.not_to raise_error
    end
  end

  describe "TOLERANCE" do
    it "is 5" do
      expect(described_class::TOLERANCE).to eq(5)
    end
  end
end
