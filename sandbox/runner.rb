require_relative "tracked_array"

MAX_STEPS = 50_000
ABSOLUTE_CONST = /::[A-Z]/

def run_sort(code, input)
  if code.match?(ABSOLUTE_CONST)
    return { error: "Code contains absolute constant references (::)" }
  end

  arr = TrackedArray.new(input)

  sandbox = Object.new
  sandbox.instance_eval(code)
  sandbox.sort(arr)

  steps = arr.steps
  if steps.length > MAX_STEPS
    return { error: "Too many steps (#{steps.length}). Max is #{MAX_STEPS}." }
  end

  {
    initial: input,
    steps: steps,
    final: arr.to_a,
    stats: { comparisons: arr.comparison_count, swaps: arr.swap_count }
  }
rescue => e
  { error: e.message }
end
