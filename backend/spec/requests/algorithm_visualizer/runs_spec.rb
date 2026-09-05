require "rails_helper"

RSpec.describe "AlgorithmVisualizer::Runs", type: :request do
  let(:valid_code) { "def sort(arr); end" }
  let(:sandbox_response) do
    {
      "initial" => [ 38, 27, 43, 3, 9, 82, 10, 1, 55, 17 ],
      "steps" => [],
      "final" => [ 1, 3, 9, 10, 17, 27, 38, 43, 55, 82 ],
      "stats" => { "comparisons" => 10, "swaps" => 5 }
    }
  end

  before do
    allow(AlgorithmVisualizer::SandboxClient).to receive(:call).and_return(sandbox_response)
  end

  describe "POST /api/algorithm_visualizer/runs" do
    context "with default input" do
      it "returns a sorted trace" do
        post "/api/algorithm_visualizer/runs", params: { code: valid_code }
        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["final"]).to be_an(Array)
        expect(body["steps"]).to be_an(Array)
        expect(body["stats"]).to include("comparisons", "swaps")
      end
    end

    context "with custom input" do
      it "passes the input to the sandbox" do
        post "/api/algorithm_visualizer/runs", params: { code: valid_code, input: [ 5, 2, 8, 1 ] }
        expect(AlgorithmVisualizer::SandboxClient).to have_received(:call)
          .with(code: valid_code, input: [ 5, 2, 8, 1 ])
      end
    end

    context "with invalid input" do
      it "rejects input that is too large" do
        post "/api/algorithm_visualizer/runs", params: { code: valid_code, input: Array.new(101, 1) }
        expect(response).to have_http_status(:unprocessable_content)
        expect(AlgorithmVisualizer::SandboxClient).not_to have_received(:call)
      end
    end

    context "with absolute constant references" do
      it "returns an error without calling the sandbox" do
        post "/api/algorithm_visualizer/runs", params: { code: "def sort(arr); ::File.read('/etc/passwd'); end" }
        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["error"]).to match(/absolute constant/)
        expect(AlgorithmVisualizer::SandboxClient).not_to have_received(:call)
      end
    end

    context "when the sandbox returns an error" do
      it "returns unprocessable_content" do
        allow(AlgorithmVisualizer::SandboxClient).to receive(:call)
          .and_return({ "error" => "Execution timed out" })
        post "/api/algorithm_visualizer/runs", params: { code: valid_code }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
