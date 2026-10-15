require "rails_helper"

RSpec.describe Arcade::LaneDodger::Rng do
  describe "#next_int" do
    it "produces deterministic output for a given seed" do
      rng = described_class.new(12345)
      first  = rng.next_int(3)
      second = rng.next_int(3)
      expect(first).to be_between(0, 2)
      expect(second).to be_between(0, 2)
    end

    it "produces the same sequence for the same seed" do
      seq1 = Array.new(10) { described_class.new(99).next_int(3) }
      seq2 = Array.new(10) { described_class.new(99).next_int(3) }
      expect(seq1).to eq(seq2)
    end

    it "produces different sequences for different seeds" do
      seq1 = 10.times.map { described_class.new(1).tap { }.next_int(100) }
      rng  = described_class.new(1)
      seq_a = 10.times.map { rng.next_int(100) }
      rng2 = described_class.new(2)
      seq_b = 10.times.map { rng2.next_int(100) }
      expect(seq_a).not_to eq(seq_b)
    end

    it "always returns values in [0, max)" do
      rng = described_class.new(42)
      100.times { expect(rng.next_int(3)).to be_between(0, 2) }
    end

    it "matches the known JS LCG output for seed 12345 first call" do
      # (1664525 * 12345 + 1013904223) mod 2^32 = 87628868, 87628868 % 3 = 2
      rng = described_class.new(12345)
      expect(rng.next_int(3)).to eq(87628868 % 3)
    end
  end
end
