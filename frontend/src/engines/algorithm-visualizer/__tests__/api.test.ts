import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fetchAlgorithms, runAlgorithm, runUserCode } from "../api"

const fetchMock = vi.fn()
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

function mockResponse(body: unknown, ok = true, status = 200) {
  fetchMock.mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

describe("fetchAlgorithms", () => {
  it("returns parsed algorithm list", async () => {
    const algos = [{ name: "bubble_sort", label: "Bubble Sort" }]
    mockResponse(algos)
    const result = await fetchAlgorithms()
    expect(result).toEqual(algos)
    expect(fetchMock).toHaveBeenCalledWith("/api/algorithm_visualizer/algorithms")
  })

  it("throws on non-ok response", async () => {
    mockResponse({}, false, 500)
    await expect(fetchAlgorithms()).rejects.toThrow("Failed to fetch algorithms")
  })
})

describe("runUserCode", () => {
  const code = "def sort(arr); end"
  const input = [3, 1, 2]
  const result = { initial: input, steps: [], final: [1, 2, 3], stats: { comparisons: 0, swaps: 0 } }

  it("posts code and input and returns result", async () => {
    mockResponse(result)
    const out = await runUserCode(code, input)
    expect(out).toEqual(result)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/algorithm_visualizer/runs",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ code, input }) })
    )
  })

  it("throws on error response with error field", async () => {
    mockResponse({ error: "boom" }, false, 422)
    await expect(runUserCode(code, input)).rejects.toThrow("boom")
  })

  it("throws generic message when no error field", async () => {
    mockResponse({}, false, 500)
    await expect(runUserCode(code, input)).rejects.toThrow("Run failed")
  })
})

describe("runAlgorithm", () => {
  const input = [3, 1, 2]
  const result = { initial: input, steps: [], final: [1, 2, 3], stats: { comparisons: 0, swaps: 0 }, name: "bubble_sort", source: "" }

  it("posts input and returns result with name", async () => {
    mockResponse(result)
    const out = await runAlgorithm("bubble_sort", input)
    expect(out).toEqual(result)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/algorithm_visualizer/algorithms/bubble_sort/run",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("throws on error response", async () => {
    mockResponse({ error: "not found" }, false, 404)
    await expect(runAlgorithm("bogus", input)).rejects.toThrow("not found")
  })

  it("throws generic message when no error field", async () => {
    mockResponse({}, false, 500)
    await expect(runAlgorithm("bubble_sort", input)).rejects.toThrow("Run failed")
  })
})
