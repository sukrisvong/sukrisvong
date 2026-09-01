require "rails_helper"

RSpec.describe AlgorithmVisualizer::SortRunner do
  let(:input) { [ 3, 1, 2 ] }
  let(:success_response) do
    {
      "initial" => [ 3, 1, 2 ],
      "steps" => [ { "type" => "swap", "indices" => [ 0, 1 ], "array" => [ 1, 3, 2 ] } ],
      "final" => [ 1, 2, 3 ],
      "stats" => { "comparisons" => 3, "swaps" => 2 }
    }
  end

  before do
    allow(AlgorithmVisualizer::SandboxClient).to receive(:call).and_return(success_response)
  end

  describe ".run" do
    it "returns a successful result from the sandbox" do
      result = described_class.run(code: "def sort(arr); end", input: input)
      expect(result.error).to be_nil
      expect(result.final).to eq([ 1, 2, 3 ])
      expect(result.stats).to eq(comparisons: 3, swaps: 2)
    end

    it "passes code and input to the sandbox client" do
      described_class.run(code: "def sort(arr); end", input: input)
      expect(AlgorithmVisualizer::SandboxClient).to have_received(:call)
        .with(code: "def sort(arr); end", input: input)
    end

    context "with absolute constant references" do
      it "rejects without calling the sandbox" do
        result = described_class.run(code: "def sort(arr); ::File.read('/etc/passwd'); end", input: input)
        expect(result.error).to match(/absolute constant/)
        expect(AlgorithmVisualizer::SandboxClient).not_to have_received(:call)
      end
    end

    context "when the sandbox returns an error" do
      it "surfaces the error" do
        allow(AlgorithmVisualizer::SandboxClient).to receive(:call)
          .and_return({ "error" => "Execution timed out" })
        result = described_class.run(code: "def sort(arr); end", input: input)
        expect(result.error).to eq("Execution timed out")
      end
    end

    context "when the sandbox is unavailable" do
      it "surfaces the connection error" do
        allow(AlgorithmVisualizer::SandboxClient).to receive(:call)
          .and_return({ "error" => "Sandbox unavailable: Connection refused" })
        result = described_class.run(code: "def sort(arr); end", input: input)
        expect(result.error).to match(/Sandbox unavailable/)
      end
    end
  end
end
