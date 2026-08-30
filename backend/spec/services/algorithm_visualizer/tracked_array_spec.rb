require "rails_helper"

RSpec.describe AlgorithmVisualizer::TrackedArray do
  subject(:arr) { described_class.new([3, 1, 2]) }

  describe "#compare" do
    it "records a compare step and returns spaceship result" do
      result = arr.compare(0, 1)
      expect(result).to eq(1)
      expect(arr.steps.last).to include(type: "compare", indices: [0, 1])
      expect(arr.comparison_count).to eq(1)
    end
  end

  describe "#swap" do
    it "swaps elements and records a swap step" do
      arr.swap(0, 1)
      expect(arr[0]).to eq(1)
      expect(arr[1]).to eq(3)
      expect(arr.steps.last).to include(type: "swap", indices: [0, 1])
      expect(arr.swap_count).to eq(1)
    end
  end

  describe "#[]=" do
    it "sets a value at the given index" do
      arr[0] = 99
      expect(arr[0]).to eq(99)
    end
  end

  describe "#length and #size" do
    it "returns the array length" do
      expect(arr.length).to eq(3)
      expect(arr.size).to eq(3)
    end
  end

  describe "#to_a" do
    it "returns a copy of the underlying data" do
      copy = arr.to_a
      arr.swap(0, 1)
      expect(copy).to eq([3, 1, 2])
    end
  end
end
