import { render, screen } from "@testing-library/react"
import SortingVisualizerPage from "../SortingVisualizerPage"

describe("SortingVisualizerPage", () => {
  it("renders the page heading", () => {
    render(<SortingVisualizerPage />)
    expect(screen.getByRole("heading", { name: "Sorting Visualizer" })).toBeInTheDocument()
  })
})
