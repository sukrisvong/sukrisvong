require "rails_helper"

RSpec.describe AlgorithmVisualizer::SortRunner do
  let(:input) { [ 3, 1, 2 ] }

  describe ".run" do
    context "with valid bubble sort code" do
      let(:code) do
        <<~RUBY
          def sort(arr)
            length = arr.length
            (length - 1).times do |pass|
              (length - 1 - pass).times do |index|
                arr.swap(index, index + 1) if arr.compare(index, index + 1) > 0
              end
            end
          end
        RUBY
      end

      it "returns a sorted result with no error" do
        result = described_class.run(code: code, input: input)
        expect(result.error).to be_nil
        expect(result.final).to eq([ 1, 2, 3 ])
        expect(result.initial).to eq([ 3, 1, 2 ])
      end

      it "records steps" do
        result = described_class.run(code: code, input: input)
        expect(result.steps).not_to be_empty
        expect(result.steps.map { _1[:type] }).to all(be_in(%w[compare swap]))
      end

      it "counts comparisons and swaps" do
        result = described_class.run(code: code, input: input)
        expect(result.stats[:comparisons]).to be > 0
        expect(result.stats[:swaps]).to be > 0
      end
    end

    context "with code that calls a forbidden Kernel method" do
      it "rejects require" do
        result = described_class.run(code: "def sort(arr); require 'json'; end", input: input)
        expect(result.error).to match(/NoMethodError|NameError/)
      end

      it "rejects system" do
        result = described_class.run(code: "def sort(arr); system('ls'); end", input: input)
        expect(result.error).to match(/NoMethodError/)
      end

      it "rejects access to undefined constants like File" do
        result = described_class.run(code: "def sort(arr); File.read('/etc/passwd'); end", input: input)
        expect(result.error).to match(/NameError/)
      end
    end

    context "with a runtime error" do
      it "returns the error message" do
        result = described_class.run(code: "def sort(arr); raise 'oops'; end", input: input)
        expect(result.error).to eq("oops")
      end
    end

    context "with code that times out" do
      it "returns a timeout error" do
        result = described_class.run(code: "def sort(arr); loop { }; end", input: input)
        expect(result.error).to match(/timed out/)
      end
    end

    context "with puts or p in user code" do
      it "runs without error and ignores output" do
        result = described_class.run(code: "def sort(arr); puts arr.length; p arr.length; end", input: input)
        expect(result.error).to be_nil
      end
    end

    context "with invalid sort (not sorted)" do
      it "still returns the result without error" do
        result = described_class.run(code: "def sort(arr); end", input: input)
        expect(result.error).to be_nil
        expect(result.final).to eq([ 3, 1, 2 ])
      end
    end

    context "with code that exceeds step limit" do
      it "returns a too many steps error" do
        stub_const("AlgorithmVisualizer::SortRunner::MAX_STEPS", 1)
        result = described_class.run(code: <<~RUBY, input: [ 3, 1, 2 ])
          def sort(arr)
            length = arr.length
            (length - 1).times do |pass|
              (length - 1 - pass).times do |index|
                arr.swap(index, index + 1) if arr.compare(index, index + 1) > 0
              end
            end
          end
        RUBY
        expect(result.error).to match(/Too many steps/)
      end
    end
  end
end
