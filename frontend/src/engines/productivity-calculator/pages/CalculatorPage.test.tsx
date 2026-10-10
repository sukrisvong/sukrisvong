import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CalculatorPage from "./CalculatorPage"

function mockFetch(body: object, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  })
}

describe("CalculatorPage", () => {
  beforeEach(() => vi.restoreAllMocks())

  // ── Tabs ──────────────────────────────────────────────────────────────────

  it("renders both tabs", () => {
    render(<CalculatorPage />)
    expect(screen.getByRole("tab", { name: "Time Based" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Unit Based" })).toBeInTheDocument()
  })

  it("shows Time Based form by default", () => {
    render(<CalculatorPage />)
    expect(screen.getByLabelText(/Hours of Work/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Units/i)).not.toBeInTheDocument()
  })

  it("switches to Unit Based form when tab clicked", async () => {
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    expect(screen.getByLabelText(/Units/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Hours of Work/i)).not.toBeInTheDocument()
  })

  it("can switch back to Time Based tab", async () => {
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    await userEvent.click(screen.getByRole("tab", { name: "Time Based" }))
    expect(screen.getByLabelText(/Hours of Work/i)).toBeInTheDocument()
  })

  it("clears result when switching tabs", async () => {
    mockFetch({ time_required: "6 hours", end_time: "03:00 PM" })
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => screen.getByText("6 hours"))
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    expect(screen.queryByText("6 hours")).not.toBeInTheDocument()
  })

  // ── Time Based form ───────────────────────────────────────────────────────

  it("submits time_based mode with correct fields", async () => {
    mockFetch({ time_required: "7 hours and 3 minutes", end_time: "04:03 PM" })
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(body.mode).toBe("time_based")
    expect(body).toHaveProperty("hours_scheduled")
    expect(body).toHaveProperty("minutes_scheduled")
    expect(body).toHaveProperty("productivity_goal")
  })

  it("shows results after successful time_based submit", async () => {
    mockFetch({ time_required: "7 hours and 3 minutes", end_time: "04:03 PM" })
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => screen.getByText("7 hours and 3 minutes"))
    expect(screen.getByText("04:03 PM")).toBeInTheDocument()
  })

  it("includes include_lunch when checkbox checked in time_based", async () => {
    mockFetch({ time_required: "6 hours and 30 minutes", end_time: "03:30 PM" })
    render(<CalculatorPage />)
    const checkbox = screen.getAllByRole("checkbox")[0]
    await userEvent.click(checkbox)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(body.include_lunch).toBe(true)
  })

  it("shows error on time_based failure", async () => {
    mockFetch({ errors: ["Invalid start time"] }, false)
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => screen.getByText("Something went wrong."))
  })

  it("shows network error message", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => screen.getByText("Could not reach the server."))
  })

  it("disables button while loading", async () => {
    let resolve: (v: unknown) => void
    global.fetch = vi.fn().mockReturnValue(new Promise(r => { resolve = r }))
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    expect(screen.getByRole("button", { name: /calculating/i })).toBeDisabled()
    resolve!({ ok: true, json: async () => ({ time_required: "6 hours", end_time: "03:00 PM" }) })
  })

  // ── Unit Based form ───────────────────────────────────────────────────────

  it("defaults productivity to 75 on unit_based tab", async () => {
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    const goalInput = screen.getByLabelText(/Productivity Goal/i) as HTMLInputElement
    expect(goalInput.value).toBe("75")
  })

  it("submits unit_based mode with correct fields", async () => {
    mockFetch({ time_required: "6 hours and 40 minutes", end_time: "03:40 PM" })
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(body.mode).toBe("unit_based")
    expect(body).toHaveProperty("units")
    expect(body).toHaveProperty("productivity_goal")
    expect(body).not.toHaveProperty("hours_scheduled")
  })

  it("shows results after successful unit_based submit", async () => {
    mockFetch({ time_required: "6 hours and 40 minutes", end_time: "03:40 PM" })
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => screen.getByText("6 hours and 40 minutes"))
    expect(screen.getByText("03:40 PM")).toBeInTheDocument()
  })

  it("includes include_lunch when checkbox checked in unit_based", async () => {
    mockFetch({ time_required: "7 hours and 10 minutes", end_time: "04:10 PM" })
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    const checkbox = screen.getByRole("checkbox")
    await userEvent.click(checkbox)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(body.include_lunch).toBe(true)
  })

  it("updates units field", async () => {
    mockFetch({ time_required: "2 hours", end_time: "11:00 AM" })
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    const unitsInput = screen.getByLabelText(/Units/i)
    await userEvent.clear(unitsInput)
    await userEvent.type(unitsInput, "8")
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(body.units).toBe("8")
  })

  it("shows error on unit_based failure", async () => {
    mockFetch({ errors: ["Units must be greater than 0"] }, false)
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => screen.getByText("Something went wrong."))
  })

  it("clears error when input changes on time_based", async () => {
    mockFetch({ errors: ["Invalid start time"] }, false)
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => screen.getByText("Something went wrong."))
    fireEvent.change(screen.getByLabelText(/Hours of Work/i), { target: { value: "7" } })
    expect(screen.queryByText("Something went wrong.")).not.toBeInTheDocument()
  })

  it("clears error when input changes on unit_based", async () => {
    mockFetch({ errors: ["Units must be greater than 0"] }, false)
    render(<CalculatorPage />)
    await userEvent.click(screen.getByRole("tab", { name: "Unit Based" }))
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }))
    await waitFor(() => screen.getByText("Something went wrong."))
    fireEvent.change(screen.getByLabelText(/Units/i), { target: { value: "10" } })
    expect(screen.queryByText("Something went wrong.")).not.toBeInTheDocument()
  })
})
