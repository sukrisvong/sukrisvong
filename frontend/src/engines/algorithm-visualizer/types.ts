/* v8 ignore file */
export interface Step {
  type: "compare" | "swap"
  indices: [number, number]
  array: number[]
}

export interface RunStats {
  comparisons: number
  swaps: number
}

export interface RunResult {
  initial: number[]
  steps: Step[]
  final: number[]
  stats: RunStats
}

export interface Algorithm {
  name: string
  label: string
  source: string
}

export interface AlgorithmRunResult extends RunResult {
  name: string
  source: string
}
