import type { Algorithm, AlgorithmRunResult, RunResult } from "./types"

const BASE = "/api/algorithm_visualizer"

export async function fetchAlgorithms(): Promise<Algorithm[]> {
  const res = await fetch(`${BASE}/algorithms`)
  if (!res.ok) throw new Error("Failed to fetch algorithms")
  return res.json()
}

export async function runUserCode(code: string, input: number[]): Promise<RunResult> {
  const res = await fetch(`${BASE}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, input }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? "Run failed")
  return body
}

export async function runAlgorithm(name: string, input: number[]): Promise<AlgorithmRunResult> {
  const res = await fetch(`${BASE}/algorithms/${name}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? "Run failed")
  return body
}
