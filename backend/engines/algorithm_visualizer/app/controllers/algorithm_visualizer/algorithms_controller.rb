module AlgorithmVisualizer
  class AlgorithmsController < ApplicationController
    DEFAULT_INPUT = RunsController::DEFAULT_INPUT

    def index
      render json: AlgorithmRegistry::ALL.map { |a| { name: a::NAME, label: a::LABEL } }
    end

    def run
      algo = AlgorithmRegistry.find(params[:id])
      return render json: { error: "Algorithm not found" }, status: :not_found unless algo

      input = parse_input
      return render json: { error: "Input must be an array of 2–100 integers" }, status: :unprocessable_content unless valid_input?(input)

      result = SortRunner.run(code: algo::SOURCE, input:)

      if result.error
        render json: { error: result.error }, status: :unprocessable_content
      else
        render json: { name: algo::NAME, label: algo::LABEL, source: algo::SOURCE,
                       initial: result.initial, steps: result.steps, final: result.final, stats: result.stats }
      end
    end

    private

    def parse_input
      raw = params[:input]
      raw.present? ? Array(raw).map(&:to_i) : DEFAULT_INPUT.dup
    end

    def valid_input?(input)
      input.is_a?(Array) && input.length.between?(2, 100) && input.all? { |v| v.is_a?(Integer) }
    end
  end
end
