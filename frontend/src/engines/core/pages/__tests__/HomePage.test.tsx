import { render, screen, act } from "@testing-library/react"
import HomePage from "../HomePage"

describe("HomePage", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders the title", async () => {
    render(<HomePage />)
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText("UNDER CONSTRUCTION")).toBeInTheDocument()
  })

  it("renders status lines", async () => {
    render(<HomePage />)
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText("FRONTEND")).toBeInTheDocument()
    expect(screen.getByText("BACKEND")).toBeInTheDocument()
    expect(screen.getByText("CONTENT")).toBeInTheDocument()
    expect(screen.getAllByText("ONLINE")).toHaveLength(2)
    expect(screen.getByText("PENDING")).toBeInTheDocument()
  })

  it("renders the boot tag", () => {
    render(<HomePage />)
    expect(screen.getByText(/SYSTEM_BOOT/)).toBeInTheDocument()
  })
})
