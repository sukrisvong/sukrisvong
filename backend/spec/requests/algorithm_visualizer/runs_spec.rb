require "rails_helper"

RSpec.describe "AlgorithmVisualizer::Runs", type: :request do
  let(:valid_code) do
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

  describe "POST /api/algorithm_visualizer/runs" do
    context "with default input" do
      it "returns a sorted trace" do
        post "/api/algorithm_visualizer/runs", params: { code: valid_code }
        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["final"]).to eq(body["initial"].sort)
        expect(body["steps"]).to be_an(Array)
        expect(body["stats"]).to include("comparisons", "swaps")
      end
    end

    context "with custom input" do
      it "sorts the provided array" do
        post "/api/algorithm_visualizer/runs", params: { code: valid_code, input: [5, 2, 8, 1] }
        body = JSON.parse(response.body)
        expect(body["final"]).to eq([1, 2, 5, 8])
      end
    end

    context "with invalid input" do
      it "rejects input that is too large" do
        post "/api/algorithm_visualizer/runs", params: { code: valid_code, input: Array.new(101, 1) }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "with forbidden code" do
      it "returns an error" do
        post "/api/algorithm_visualizer/runs", params: { code: "require 'json'\ndef sort(arr); end" }
        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["error"]).to match(/forbidden/)
      end
    end
  end
end
