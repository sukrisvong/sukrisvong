require "rails_helper"

RSpec.describe "AlgorithmVisualizer::Algorithms", type: :request do
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
        it "returns a correctly sorted result" do
          post "/api/algorithm_visualizer/algorithms/#{algo::NAME}/run"
          expect(response).to have_http_status(:ok)
          body = JSON.parse(response.body)
          expect(body["final"]).to eq(body["initial"].sort)
          expect(body["name"]).to eq(algo::NAME)
          expect(body["source"]).to be_present
        end
      end
    end

    context "with custom input" do
      it "sorts the provided array" do
        post "/api/algorithm_visualizer/algorithms/bubble_sort/run", params: { input: [ 5, 2, 8 ] }
        body = JSON.parse(response.body)
        expect(body["final"]).to eq([ 2, 5, 8 ])
      end
    end

    context "with invalid input" do
      it "rejects oversized input" do
        post "/api/algorithm_visualizer/algorithms/bubble_sort/run", params: { input: Array.new(101, 1) }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "when the runner returns an error" do
      it "returns unprocessable_content" do
        allow(AlgorithmVisualizer::SortRunner).to receive(:run).and_return(
          AlgorithmVisualizer::SortRunner::Result.new(initial: nil, steps: nil, final: nil, stats: nil, error: "boom")
        )
        post "/api/algorithm_visualizer/algorithms/bubble_sort/run"
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "with unknown algorithm" do
      it "returns 404" do
        post "/api/algorithm_visualizer/algorithms/bogus/run"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
