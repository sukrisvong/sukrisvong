import { render, screen } from "@testing-library/react"
import AlgorithmVisualizerPage from "../AlgorithmVisualizerPage"

describe("AlgorithmVisualizerPage", () => {
  it("renders the page heading", () => {
    render(<AlgorithmVisualizerPage />)
    expect(screen.getByRole("heading", { name: "Algorithm Visualizer" })).toBeInTheDocument()
  })
})
