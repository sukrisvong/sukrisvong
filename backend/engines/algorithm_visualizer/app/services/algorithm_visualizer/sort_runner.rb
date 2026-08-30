module AlgorithmVisualizer
  class SortRunner
    TIMEOUT_SECONDS = 3
    MAX_STEPS = 50_000

    Result = Data.define(:initial, :steps, :final, :stats, :error)

    def self.run(code:, input:)
      new(code: code, input: input).run
    end

    def initialize(code:, input:)
      @code = code
      @input = input
    end

    def run
      arr = TrackedArray.new(@input)
      sandbox = SortSandbox.new

      begin
        Timeout.timeout(TIMEOUT_SECONDS) do
          sandbox.instance_eval(@code)
          sandbox.sort(arr)
        end
      rescue Timeout::Error
        return Result.new(initial: nil, steps: nil, final: nil, stats: nil,
                          error: "Execution timed out (#{TIMEOUT_SECONDS}s limit)")
      rescue ::NameError, ::NoMethodError => e
        return Result.new(initial: nil, steps: nil, final: nil, stats: nil,
                          error: "#{e.class}: #{e.message}")
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

  # BasicObject-based sandbox: inherits nothing from Kernel.
  # Undefined constants and methods raise immediately — whitelist only.
  class SortSandbox < BasicObject
    def self.const_missing(name)
      ::Kernel.raise ::NameError, "uninitialized constant #{name}"
    end

    # Safe Kernel methods explicitly re-exposed.
    def raise(*args)
      ::Kernel.raise(*args)
    end

    def loop(&block)
      ::Kernel.loop(&block)
    end

    def puts(*args)
      # silently swallow — no output side effects
    end

    def p(*args)
      # silently swallow
    end

    def method_missing(name, *_args, &_block)
      ::Kernel.raise ::NoMethodError, "undefined method '#{name}'"
    end
  end
end
