import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import PlaybackControls from "../components/PlaybackControls"

const baseProps = {
  playing: false,
  done: false,
  stepIndex: -1,
  totalSteps: 10,
  speed: 300,
  onPlay: vi.fn(),
  onPause: vi.fn(),
  onStepBack: vi.fn(),
  onStepForward: vi.fn(),
  onReset: vi.fn(),
  onJumpToEnd: vi.fn(),
  onSpeedChange: vi.fn(),
}

describe("PlaybackControls", () => {
  it("renders a play button when not playing", () => {
    render(<PlaybackControls {...baseProps} />)
    expect(screen.getAllByTitle("Play").length).toBeGreaterThan(0)
  })

  it("renders a pause button when playing", () => {
    render(<PlaybackControls {...baseProps} playing={true} stepIndex={2} />)
    expect(screen.getAllByTitle("Pause").length).toBeGreaterThan(0)
  })

  it("calls onPlay when play button is clicked", async () => {
    const onPlay = vi.fn()
    const user = userEvent.setup()
    render(<PlaybackControls {...baseProps} onPlay={onPlay} />)
    await user.click(screen.getByTitle("Play"))
    expect(onPlay).toHaveBeenCalled()
  })

  it("calls onPause when pause button is clicked", async () => {
    const onPause = vi.fn()
    const user = userEvent.setup()
    render(<PlaybackControls {...baseProps} playing={true} stepIndex={2} onPause={onPause} />)
    await user.click(screen.getByTitle("Pause"))
    expect(onPause).toHaveBeenCalled()
  })

  it("calls onSpeedChange when a speed is clicked", async () => {
    const onSpeedChange = vi.fn()
    const user = userEvent.setup()
    render(<PlaybackControls {...baseProps} onSpeedChange={onSpeedChange} />)
    await user.click(screen.getByText("4×"))
    expect(onSpeedChange).toHaveBeenCalledWith(75)
  })

  it("shows step counter as — when at start", () => {
    render(<PlaybackControls {...baseProps} stepIndex={-1} />)
    expect(screen.getByText("— / 10")).toBeInTheDocument()
  })

  it("shows current step number when playing", () => {
    render(<PlaybackControls {...baseProps} stepIndex={4} />)
    expect(screen.getByText("5 / 10")).toBeInTheDocument()
  })

  it("marks the active speed button", () => {
    render(<PlaybackControls {...baseProps} speed={150} />)
    expect(screen.getByText("2×").className).toMatch(/activeSpeed/)
  })

  it("shows 0 progress when totalSteps is 0", () => {
    const { container } = render(<PlaybackControls {...baseProps} totalSteps={0} />)
    const fill = container.querySelector("[class*=progressFill]") as HTMLElement
    expect(fill.style.width).toBe("0%")
  })
})
