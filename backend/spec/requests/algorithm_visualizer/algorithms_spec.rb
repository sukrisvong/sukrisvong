require "rails_helper"

RSpec.describe "AlgorithmVisualizer::Algorithms", type: :request do
  let(:default_input) { AlgorithmVisualizer::RunsController::DEFAULT_INPUT.to_a }
  let(:sandbox_response) do
    {
      "initial" => default_input,
      "steps" => [],
      "final" => default_input.sort,
      "stats" => { "comparisons" => 10, "swaps" => 5 }
    }
  end

  before do
    allow(AlgorithmVisualizer::SandboxClient).to receive(:call).and_return(sandbox_response)
  end

  describe "GET /api/algorithm_visualizer/algorithms" do
    it "returns all algorithm names and labels" do
      get "/api/algorithm_visualizer/algorithms"
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.map { _1["name"] }).to contain_exactly(
        "bubble_sort", "selection_sort", "insertion_sort", "shell_sort", "quick_sort", "heap_sort"
      )
      expect(body.first).to include("name", "label")
    end
  end

  describe "POST /api/algorithm_visualizer/algorithms/:name/run" do
    AlgorithmVisualizer::AlgorithmRegistry::ALL.each do |algo|
      context "with #{algo::LABEL}" do
        it "returns ok with name and source" do
          post "/api/algorithm_visualizer/algorithms/#{algo::NAME}/run"
          expect(response).to have_http_status(:ok)
          body = JSON.parse(response.body)
          expect(body["name"]).to eq(algo::NAME)
          expect(body["source"]).to be_present
        end
      end
    end

    context "with custom input" do
      it "passes input to the sandbox" do
        post "/api/algorithm_visualizer/algorithms/bubble_sort/run", params: { input: [ 5, 2, 8 ] }
        expect(AlgorithmVisualizer::SandboxClient).to have_received(:call)
          .with(hash_including(input: [ 5, 2, 8 ]))
      end
    end

    context "with invalid input" do
      it "rejects oversized input" do
        post "/api/algorithm_visualizer/algorithms/bubble_sort/run", params: { input: Array.new(101, 1) }
        expect(response).to have_http_status(:unprocessable_content)
        expect(AlgorithmVisualizer::SandboxClient).not_to have_received(:call)
      end
    end

    context "when the runner returns an error" do
      it "returns unprocessable_content" do
        allow(AlgorithmVisualizer::SandboxClient).to receive(:call)
          .and_return({ "error" => "boom" })
        post "/api/algorithm_visualizer/algorithms/bubble_sort/run"
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "with unknown algorithm" do
      it "returns 404" do
        post "/api/algorithm_visualizer/algorithms/bogus/run"
        expect(response).to have_http_status(:not_found)
        expect(AlgorithmVisualizer::SandboxClient).not_to have_received(:call)
      end
    end
  end
end
