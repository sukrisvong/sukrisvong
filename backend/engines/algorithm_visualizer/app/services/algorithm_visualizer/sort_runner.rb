module AlgorithmVisualizer
  class SortRunner
    TIMEOUT_SECONDS = 3
    MAX_STEPS = 50_000
    FORBIDDEN = /\b(require|require_relative|load|system|exec|spawn|fork|eval|open|IO|File|Dir|Net|Socket|Kernel|Process|ObjectSpace|Binding|Method|UnboundMethod|BasicObject|__send__|send|public_send|instance_eval|class_eval|module_eval)\b/

    Result = Data.define(:initial, :steps, :final, :stats, :error)

    def self.run(code:, input:)
      new(code: code, input: input).run
    end

    def initialize(code:, input:)
      @code = code
      @input = input
    end

    def run
      if @code.match?(FORBIDDEN)
        return Result.new(initial: nil, steps: nil, final: nil, stats: nil,
                          error: "Code contains forbidden operations")
      end

      arr = TrackedArray.new(@input)
      sandbox = SortSandbox.new(arr)

      begin
        Timeout.timeout(TIMEOUT_SECONDS) do
          sandbox.instance_eval(@code)
          sandbox.sort(arr)
        end
      rescue Timeout::Error
        return Result.new(initial: nil, steps: nil, final: nil, stats: nil,
                          error: "Execution timed out (#{TIMEOUT_SECONDS}s limit)")
      rescue => e
        return Result.new(initial: nil, steps: nil, final: nil, stats: nil,
                          error: e.message)
      end

      steps = arr.steps
      if steps.length > MAX_STEPS
        return Result.new(initial: nil, steps: nil, final: nil, stats: nil,
                          error: "Too many steps (#{steps.length}). Max is #{MAX_STEPS}.")
      end

      Result.new(
        initial: @input.dup,
        steps: steps,
        final: arr.to_a,
        stats: { comparisons: arr.comparison_count, swaps: arr.swap_count },
        error: nil
      )
    end
  end

  # Sandbox object — only exposes TrackedArray and basic Ruby
  class SortSandbox
    def initialize(arr)
      @arr = arr
    end
  end
end
