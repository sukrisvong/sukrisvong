module AlgorithmVisualizer
  class SortRunner
    ABSOLUTE_CONST = /::[A-Z]/

    Result = Data.define(:initial, :steps, :final, :stats, :error)

    def self.run(code:, input:)
      new(code: code, input: input).run
    end

    def initialize(code:, input:)
      @code = code
      @input = input
    end

    def run
      if @code.match?(ABSOLUTE_CONST)
        return Result.new(initial: nil, steps: nil, final: nil, stats: nil,
                          error: "Code contains absolute constant references (::)")
      end

      response = SandboxClient.call(code: @code, input: @input)

      if response["error"]
        Result.new(initial: nil, steps: nil, final: nil, stats: nil, error: response["error"])
      else
        Result.new(
          initial: response["initial"],
          steps: response["steps"],
          final: response["final"],
          stats: response["stats"].transform_keys(&:to_sym),
          error: nil
        )
      end
    end
  end
end
