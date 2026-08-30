import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CalculatorPage from "../CalculatorPage"

function renderPage() {
  return render(<CalculatorPage />)
}

describe("CalculatorPage", () => {
  it("renders the form fields", () => {
    renderPage()
    expect(screen.getByLabelText("Start Time")).toBeInTheDocument()
    expect(screen.getByLabelText("Hours of Work")).toBeInTheDocument()
    expect(screen.getByLabelText("Minutes of Work")).toBeInTheDocument()
    expect(screen.getByLabelText("Productivity Goal (%)")).toBeInTheDocument()
  })

  it("renders the calculate button", () => {
    renderPage()
    expect(screen.getByRole("button", { name: "Calculate" })).toBeInTheDocument()
  })

  it("shows result cards on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ time_required: "7 hours", end_time: "04:00 PM" }),
    })

    renderPage()
    await userEvent.click(screen.getByRole("button", { name: "Calculate" }))

    await waitFor(() => {
      expect(screen.getByText("7 hours")).toBeInTheDocument()
      expect(screen.getByText("04:00 PM")).toBeInTheDocument()
    })
  })

  it("shows error on API failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Something went wrong." }),
    })

    renderPage()
    await userEvent.click(screen.getByRole("button", { name: "Calculate" }))

    await waitFor(() => {
      expect(screen.getByText("Something went wrong.")).toBeInTheDocument()
    })
  })

  it("shows default error when API returns no error message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })

    renderPage()
    await userEvent.click(screen.getByRole("button", { name: "Calculate" }))

    await waitFor(() => {
      expect(screen.getByText("Something went wrong.")).toBeInTheDocument()
    })
  })

  it("shows fallback error when fetch throws", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))

    renderPage()
    await userEvent.click(screen.getByRole("button", { name: "Calculate" }))

    await waitFor(() => {
      expect(screen.getByText("Could not reach the server.")).toBeInTheDocument()
    })
  })

  it("clears result and error when input changes", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ time_required: "7 hours", end_time: "04:00 PM" }),
    })

    renderPage()
    await userEvent.click(screen.getByRole("button", { name: "Calculate" }))
    await waitFor(() => expect(screen.getByText("7 hours")).toBeInTheDocument())

    await userEvent.clear(screen.getByLabelText("Hours of Work"))
    await userEvent.type(screen.getByLabelText("Hours of Work"), "5")

    expect(screen.queryByText("7 hours")).not.toBeInTheDocument()
  })

  it("shows loading state while fetching", async () => {
    let resolve: (v: unknown) => void
    global.fetch = vi.fn().mockReturnValue(new Promise(r => { resolve = r }))

    renderPage()
    await userEvent.click(screen.getByRole("button", { name: "Calculate" }))

    expect(screen.getByRole("button", { name: "Calculating…" })).toBeDisabled()

    resolve!({
      ok: true,
      json: async () => ({ time_required: "7 hours", end_time: "04:00 PM" }),
    })

    await waitFor(() => expect(screen.getByRole("button", { name: "Calculate" })).not.toBeDisabled())
  })
})
