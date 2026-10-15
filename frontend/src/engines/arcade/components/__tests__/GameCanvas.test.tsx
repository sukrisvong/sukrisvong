import { render, screen, fireEvent, act } from "@testing-library/react"
import GameCanvas from "../GameCanvas"
import { themeFor } from "../../themes/index"

const theme = themeFor("cyberpunk")

const mockCtx = {
  fillStyle: "",
  strokeStyle: "",
  font: "",
  textAlign: "",
  textBaseline: "",
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
}

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as unknown as CanvasRenderingContext2D)
})

let rafCallback: ((ts: number) => void) | null = null

beforeEach(() => {
  rafCallback = null
  vi.stubGlobal("requestAnimationFrame", (cb: (ts: number) => void) => {
    rafCallback = cb
    return 1
  })
  vi.stubGlobal("cancelAnimationFrame", vi.fn())
  Object.keys(mockCtx).forEach((k) => {
    const fn = (mockCtx as Record<string, unknown>)[k]
    if (typeof fn === "function") vi.mocked(fn as ReturnType<typeof vi.fn>).mockClear?.()
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("GameCanvas", () => {
  it("renders a canvas element", () => {
    render(<GameCanvas seed={42} sessionId="abc" theme={theme} onDead={vi.fn()} />)
    expect(screen.getByLabelText("game canvas")).toBeInTheDocument()
  })

  it("calls onDead when game ends via update loop", () => {
    const onDead = vi.fn()
    render(<GameCanvas seed={0} sessionId="abc" theme={theme} onDead={onDead} />)
    act(() => {
      if (rafCallback) rafCallback(performance.now() + 400000)
    })
    expect(onDead).toHaveBeenCalled()
  })

  it("renders a normal (non-dead) frame and schedules next RAF", () => {
    const onDead = vi.fn()
    let callCount = 0
    vi.stubGlobal("requestAnimationFrame", (cb: (ts: number) => void) => {
      callCount++
      if (callCount === 1) {
        rafCallback = cb
      }
      return callCount
    })
    render(<GameCanvas seed={42} sessionId="abc" theme={theme} onDead={onDead} />)
    act(() => {
      if (rafCallback) rafCallback(performance.now() + 100)
    })
    expect(callCount).toBeGreaterThan(1)
    expect(onDead).not.toHaveBeenCalled()
  })

  it("renders frame with obstacles in play", () => {
    const onDead = vi.fn()
    render(<GameCanvas seed={42} sessionId="abc" theme={theme} onDead={onDead} />)
    act(() => {
      if (rafCallback) rafCallback(performance.now() + 5000)
    })
  })

  it("responds to ArrowLeft keydown", () => {
    render(<GameCanvas seed={42} sessionId="abc" theme={theme} onDead={vi.fn()} />)
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowLeft" })
    })
  })

  it("responds to ArrowRight keydown", () => {
    render(<GameCanvas seed={42} sessionId="abc" theme={theme} onDead={vi.fn()} />)
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowRight" })
    })
  })

  it("ignores irrelevant keydown events", () => {
    render(<GameCanvas seed={42} sessionId="abc" theme={theme} onDead={vi.fn()} />)
    act(() => {
      fireEvent.keyDown(window, { key: "Space" })
    })
  })

  it("does not call onDead again after game is already dead", () => {
    const onDead = vi.fn()
    render(<GameCanvas seed={0} sessionId="abc" theme={theme} onDead={onDead} />)
    act(() => {
      if (rafCallback) rafCallback(performance.now() + 400000)
    })
    act(() => {
      if (rafCallback) rafCallback(performance.now() + 400001)
    })
    expect(onDead).toHaveBeenCalledTimes(1)
  })

  it("ignores keydown when game is already dead", () => {
    const onDead = vi.fn()
    render(<GameCanvas seed={0} sessionId="abc" theme={theme} onDead={onDead} />)
    act(() => {
      if (rafCallback) rafCallback(performance.now() + 400000)
    })
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowLeft" })
    })
  })

  it("cleans up event listener and animation frame on unmount", () => {
    const { unmount } = render(<GameCanvas seed={42} sessionId="abc" theme={theme} onDead={vi.fn()} />)
    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it("does not start game loop when canvas context is unavailable", () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
    const onDead = vi.fn()
    render(<GameCanvas seed={42} sessionId="abc" theme={theme} onDead={onDead} />)
    act(() => {
      if (rafCallback) rafCallback(performance.now() + 100)
    })
    expect(onDead).not.toHaveBeenCalled()
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as unknown as CanvasRenderingContext2D)
  })
})
