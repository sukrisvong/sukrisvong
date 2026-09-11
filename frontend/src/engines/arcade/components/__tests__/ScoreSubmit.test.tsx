import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import ScoreSubmit from "../ScoreSubmit"
import { themeFor } from "../../themes/index"
import * as api from "../../api"

vi.mock("../../api")
const mockSubmitScore = vi.mocked(api.submitScore)

const theme = themeFor("cyberpunk")

const baseProps = {
  sessionId: "sess-1",
  score: 100,
  theme,
  themeId: "cyberpunk" as const,
  inputs: [],
  onSubmitted: vi.fn(),
}

describe("ScoreSubmit", () => {
  it("renders score and form", () => {
    render(<ScoreSubmit {...baseProps} />)
    expect(screen.getByText(/GAME OVER/)).toBeInTheDocument()
    expect(screen.getByText(/100/)).toBeInTheDocument()
    expect(screen.getByLabelText("Enter your name:")).toBeInTheDocument()
  })

  it("submit button is disabled when name is empty", () => {
    render(<ScoreSubmit {...baseProps} />)
    expect(screen.getByRole("button", { name: "Submit Score" })).toBeDisabled()
  })

  it("does nothing when form submitted with only whitespace name", async () => {
    render(<ScoreSubmit {...baseProps} />)
    fireEvent.change(screen.getByLabelText("Enter your name:"), { target: { value: "   " } })
    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "Submit Score" }).closest("form")!)
    })
    expect(mockSubmitScore).not.toHaveBeenCalled()
  })

  it("submits successfully and calls onSubmitted", async () => {
    const onSubmitted = vi.fn()
    const result = { id: 1, score: 100, rank: 1, player_name: "Alice" }
    mockSubmitScore.mockResolvedValue(result)
    render(<ScoreSubmit {...baseProps} onSubmitted={onSubmitted} />)

    fireEvent.change(screen.getByLabelText("Enter your name:"), { target: { value: "Alice" } })
    fireEvent.click(screen.getByRole("button", { name: "Submit Score" }))

    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(result))
  })

  it("shows error when submission fails", async () => {
    mockSubmitScore.mockRejectedValue(new Error("Score could not be verified"))
    render(<ScoreSubmit {...baseProps} />)

    fireEvent.change(screen.getByLabelText("Enter your name:"), { target: { value: "Bob" } })
    fireEvent.click(screen.getByRole("button", { name: "Submit Score" }))

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Score could not be verified"))
  })

  it("shows generic error when non-Error is thrown", async () => {
    mockSubmitScore.mockRejectedValue("string error")
    render(<ScoreSubmit {...baseProps} />)

    fireEvent.change(screen.getByLabelText("Enter your name:"), { target: { value: "Bob" } })
    fireEvent.click(screen.getByRole("button", { name: "Submit Score" }))

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Submission failed"))
  })
})
