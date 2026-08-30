require "rails_helper"

RSpec.describe AlgorithmVisualizer::SortRunner do
  let(:input) { [3, 1, 2] }

  describe ".run" do
    context "with valid bubble sort code" do
      let(:code) do
        <<~RUBY
          def sort(arr)
            n = arr.length
            (n - 1).times do |i|
              (n - 1 - i).times do |j|
                arr.swap(j, j + 1) if arr.compare(j, j + 1) > 0
              end
            end
          end
        RUBY
      end

      it "returns a sorted result with no error" do
        result = described_class.run(code:, input:)
        expect(result.error).to be_nil
        expect(result.final).to eq([1, 2, 3])
        expect(result.initial).to eq([3, 1, 2])
      end

      it "records steps" do
        result = described_class.run(code:, input:)
        expect(result.steps).not_to be_empty
        expect(result.steps.map { _1[:type] }).to all(be_in(%w[compare swap]))
      end

      it "counts comparisons and swaps" do
        result = described_class.run(code:, input:)
        expect(result.stats[:comparisons]).to be > 0
        expect(result.stats[:swaps]).to be > 0
      end
    end

    context "with forbidden code" do
      it "rejects require" do
        result = described_class.run(code: "require 'json'\ndef sort(arr); end", input:)
        expect(result.error).to match(/forbidden/)
      end

      it "rejects system calls" do
        result = described_class.run(code: "def sort(arr); system('ls'); end", input:)
        expect(result.error).to match(/forbidden/)
      end
    end

    context "with a runtime error" do
      it "returns the error message" do
        result = described_class.run(code: "def sort(arr); raise 'oops'; end", input:)
        expect(result.error).to eq("oops")
      end
    end

    context "with code that times out" do
      it "returns a timeout error" do
        result = described_class.run(code: "def sort(arr); loop { }; end", input:)
        expect(result.error).to match(/timed out/)
      end
    end

    context "with invalid sort (not sorted)" do
      it "still returns the result without error" do
        result = described_class.run(code: "def sort(arr); end", input:)
        expect(result.error).to be_nil
        expect(result.final).to eq([3, 1, 2])
      end
    end

    context "with code that exceeds step limit" do
      it "returns a too many steps error" do
        stub_const("AlgorithmVisualizer::SortRunner::MAX_STEPS", 1)
        result = described_class.run(code: <<~RUBY, input: [3, 1, 2])
          def sort(arr)
            n = arr.length
            (n - 1).times do |i|
              (n - 1 - i).times do |j|
                arr.swap(j, j + 1) if arr.compare(j, j + 1) > 0
              end
            end
          end
        RUBY
        expect(result.error).to match(/Too many steps/)
      end
    end
  end
end
