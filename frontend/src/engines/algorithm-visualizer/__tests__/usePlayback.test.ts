import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { usePlayback } from "../hooks/usePlayback"

const initial = [3, 1, 2]
const steps = [
  { type: "compare" as const, indices: [0, 1] as [number, number], array: [3, 1, 2] },
  { type: "swap" as const, indices: [0, 1] as [number, number], array: [1, 3, 2] },
  { type: "compare" as const, indices: [1, 2] as [number, number], array: [1, 3, 2] },
]

describe("usePlayback", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("starts at the initial state", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    expect(result.current.currentArray).toEqual(initial)
    expect(result.current.activeIndices).toBeNull()
    expect(result.current.activeType).toBeNull()
    expect(result.current.stepIndex).toBe(-1)
    expect(result.current.done).toBe(false)
  })

  it("steps forward one step at a time", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.stepForward())
    expect(result.current.stepIndex).toBe(0)
    expect(result.current.activeType).toBe("compare")
    expect(result.current.activeIndices).toEqual([0, 1])
  })

  it("does not step forward past the end", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.jumpToEnd())
    act(() => result.current.stepForward())
    expect(result.current.stepIndex).toBe(steps.length - 1)
  })

  it("steps back and does not go below -1", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.stepForward())
    act(() => result.current.stepBack())
    expect(result.current.stepIndex).toBe(-1)
    act(() => result.current.stepBack())
    expect(result.current.stepIndex).toBe(-1)
  })

  it("resets to the beginning", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.jumpToEnd())
    act(() => result.current.reset())
    expect(result.current.stepIndex).toBe(-1)
    expect(result.current.playing).toBe(false)
  })

  it("jumps to the last step", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.jumpToEnd())
    expect(result.current.stepIndex).toBe(steps.length - 1)
    expect(result.current.done).toBe(true)
  })

  it("plays through steps automatically", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.play())
    expect(result.current.playing).toBe(true)
    act(() => vi.advanceTimersByTime(result.current.speed * steps.length + 50))
    expect(result.current.done).toBe(true)
    expect(result.current.playing).toBe(false)
  })

  it("pauses playback", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(result.current.speed))
    act(() => result.current.pause())
    const idx = result.current.stepIndex
    act(() => vi.advanceTimersByTime(result.current.speed * 3))
    expect(result.current.stepIndex).toBe(idx)
  })

  it("changes playback speed", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.setSpeed(75))
    expect(result.current.speed).toBe(75)
  })

  it("does not play when already done", () => {
    const { result } = renderHook(() => usePlayback(initial, steps))
    act(() => result.current.jumpToEnd())
    act(() => result.current.play())
    expect(result.current.playing).toBe(false)
  })

  it("resets when steps change", () => {
    const { result, rerender } = renderHook(
      ({ s }) => usePlayback(initial, s),
      { initialProps: { s: steps } }
    )
    act(() => result.current.jumpToEnd())
    rerender({ s: [steps[0]] })
    expect(result.current.stepIndex).toBe(-1)
  })
})
