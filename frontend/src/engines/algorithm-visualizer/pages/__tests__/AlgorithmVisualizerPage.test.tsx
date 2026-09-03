import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as api from "../../api"
import AlgorithmVisualizerPage from "../AlgorithmVisualizerPage"

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="monaco-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

vi.mock("../../api")

const mockAlgorithms = [
  { name: "bubble_sort", label: "Bubble Sort", source: "def sort(arr); end" },
  { name: "quick_sort", label: "Quick Sort", source: "def sort(arr); end" },
]

const mockRunResult = {
  initial: [3, 1, 2],
  steps: [{ type: "swap" as const, indices: [0, 1] as [number, number], array: [1, 3, 2] }],
  final: [1, 2, 3],
  stats: { comparisons: 2, swaps: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.fetchAlgorithms).mockResolvedValue(mockAlgorithms)
  vi.mocked(api.runUserCode).mockResolvedValue(mockRunResult)
  vi.mocked(api.runAlgorithm).mockResolvedValue({ ...mockRunResult, name: "bubble_sort", source: "" })
})

describe("AlgorithmVisualizerPage", () => {
  it("renders the page heading", async () => {
    render(<AlgorithmVisualizerPage />)
    expect(screen.getByRole("heading", { name: "Sort Visualizer" })).toBeInTheDocument()
  })

  it("loads and displays algorithm options", async () => {
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Bubble Sort" })).toBeInTheDocument()
    })
  })

  it("runs user code on RUN click", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    await user.click(screen.getByRole("button", { name: "▶ RUN" }))
    await waitFor(() => {
      expect(api.runUserCode).toHaveBeenCalled()
    })
  })

  it("shows stats after a successful run", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    await user.click(screen.getByRole("button", { name: "▶ RUN" }))
    await waitFor(() => {
      expect(screen.getAllByText("2").length).toBeGreaterThan(0)
    })
  })

  it("shows an error message when the run fails", async () => {
    vi.mocked(api.runUserCode).mockRejectedValue(new Error("Code contains absolute constant references"))
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    await user.click(screen.getByRole("button", { name: "▶ RUN" }))
    await waitFor(() => {
      expect(screen.getByText(/absolute constant/i)).toBeInTheDocument()
    })
  })

  it("runs comparison algorithm", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    await user.click(screen.getByRole("button", { name: "▶ RUN COMPARISON" }))
    await waitFor(() => {
      expect(api.runAlgorithm).toHaveBeenCalledWith("bubble_sort", expect.any(Array))
    })
  })

  it("resets input to default", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)

    const textarea = screen.getByRole("textbox", { name: "Input array" })
    await user.clear(textarea)
    await user.type(textarea, "5, 3, 1")
    await user.click(screen.getByRole("button", { name: /reset to default/i }))

    expect(textarea).toHaveValue("38, 27, 43, 3, 9, 82, 10, 1, 55, 17")
  })

  it("shows comparison error when comparison run fails", async () => {
    vi.mocked(api.runAlgorithm).mockRejectedValue(new Error("sandbox error"))
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    await user.click(screen.getByRole("button", { name: "▶ RUN COMPARISON" }))
    await waitFor(() => {
      expect(screen.getByText(/sandbox error/i)).toBeInTheDocument()
    })
  })

  it("uses the newly selected algorithm on next comparison run", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Quick Sort" }))

    await user.selectOptions(screen.getByRole("combobox"), "quick_sort")
    await user.click(screen.getByRole("button", { name: "▶ RUN COMPARISON" }))
    await waitFor(() => {
      expect(api.runAlgorithm).toHaveBeenCalledWith("quick_sort", expect.any(Array))
    })
  })

  it("shows playback controls after a successful run", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    await user.click(screen.getByRole("button", { name: "▶ RUN" }))
    await waitFor(() => {
      expect(screen.getAllByTitle("Play").length).toBeGreaterThan(0)
    })
  })

  it("shows error without calling sandbox when input is invalid", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)

    const textarea = screen.getByRole("textbox", { name: "Input array" })
    await user.clear(textarea)
    await user.type(textarea, "not a number")
    await user.click(screen.getByRole("button", { name: "▶ RUN" }))

    expect(api.runUserCode).not.toHaveBeenCalled()
    expect(screen.getByText(/Enter 2–100 integers/i)).toBeInTheDocument()
  })

  it("shows 'Unknown error' when a non-Error is thrown from user run", async () => {
    vi.mocked(api.runUserCode).mockRejectedValue("string error")
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    await user.click(screen.getByRole("button", { name: "▶ RUN" }))
    await waitFor(() => {
      expect(screen.getByText("Unknown error")).toBeInTheDocument()
    })
  })

  it("shows 'Unknown error' when a non-Error is thrown from comparison run", async () => {
    vi.mocked(api.runAlgorithm).mockRejectedValue("string error")
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    await user.click(screen.getByRole("button", { name: "▶ RUN COMPARISON" }))
    await waitFor(() => {
      expect(screen.getAllByText("Unknown error").length).toBeGreaterThan(0)
    })
  })

  it("does not run comparison when no algorithm is selected", async () => {
    vi.mocked(api.fetchAlgorithms).mockResolvedValue([])
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => expect(api.fetchAlgorithms).toHaveBeenCalled())

    await user.click(screen.getByRole("button", { name: "▶ RUN COMPARISON" }))
    expect(api.runAlgorithm).not.toHaveBeenCalled()
  })

  it("updates code when editor content changes", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    const editor = screen.getByTestId("monaco-editor")
    await user.clear(editor)
    await user.type(editor, "def sort(arr); end")
    expect(editor).toHaveValue("def sort(arr); end")
  })

  it("does not crash when fetchAlgorithms rejects", async () => {
    vi.mocked(api.fetchAlgorithms).mockRejectedValue(new Error("network error"))
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => expect(api.fetchAlgorithms).toHaveBeenCalled())
    expect(screen.getByRole("heading", { name: "Sort Visualizer" })).toBeInTheDocument()
  })

  it("does not run comparison when input is invalid", async () => {
    const user = userEvent.setup()
    render(<AlgorithmVisualizerPage />)
    await waitFor(() => screen.getByRole("option", { name: "Bubble Sort" }))

    const textarea = screen.getByRole("textbox", { name: "Input array" })
    await user.clear(textarea)
    await user.type(textarea, "abc")
    await user.click(screen.getByRole("button", { name: "▶ RUN COMPARISON" }))

    expect(api.runAlgorithm).not.toHaveBeenCalled()
  })
})
