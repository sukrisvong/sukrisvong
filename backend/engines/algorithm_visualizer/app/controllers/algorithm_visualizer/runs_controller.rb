module AlgorithmVisualizer
  class RunsController < ApplicationController
    DEFAULT_INPUT = [ 38, 27, 43, 3, 9, 82, 10, 1, 55, 17 ].freeze

    def create
      input = parse_input
      return render json: { error: "Input must be an array of 2–100 integers" }, status: :unprocessable_content unless valid_input?(input)

      result = SortRunner.run(code: params.require(:code), input: input)

      if result.error
        render json: { error: result.error }, status: :unprocessable_content
      else
        render json: serialize(result)
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

    def serialize(result)
      {
        initial: result.initial,
        steps: result.steps,
        final: result.final,
        stats: result.stats
      }
    end
  end
end
