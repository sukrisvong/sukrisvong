import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import BarChart from "../components/BarChart"

describe("BarChart", () => {
  it("renders bars for each value", () => {
    const { container } = render(
      <BarChart values={[3, 1, 2]} activeIndices={null} activeType={null} />
    )
    expect(container.querySelectorAll("[class*=barWrapper]").length).toBe(3)
  })

  it("shows value labels when 20 or fewer bars", () => {
    render(<BarChart values={[3, 1, 2]} activeIndices={null} activeType={null} />)
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("hides labels when more than 20 bars", () => {
    const values = Array.from({ length: 21 }, (_, i) => i + 1)
    render(<BarChart values={values} activeIndices={null} activeType={null} />)
    expect(screen.queryByText("1")).not.toBeInTheDocument()
  })

  it("applies compare highlight to active indices", () => {
    const { container } = render(
      <BarChart values={[3, 1, 2]} activeIndices={[0, 1]} activeType="compare" />
    )
    const wrappers = container.querySelectorAll("[class*=barWrapper]")
    expect(wrappers[0].className).toMatch(/compare/)
    expect(wrappers[2].className).toMatch(/normal/)
  })

  it("applies swap highlight to active indices", () => {
    const { container } = render(
      <BarChart values={[3, 1, 2]} activeIndices={[1, 2]} activeType="swap" />
    )
    const wrappers = container.querySelectorAll("[class*=barWrapper]")
    expect(wrappers[1].className).toMatch(/swap/)
    expect(wrappers[0].className).toMatch(/normal/)
  })

  it("renders an optional label", () => {
    render(<BarChart values={[1, 2]} activeIndices={null} activeType={null} label="YOUR CODE" />)
    expect(screen.getByText("YOUR CODE")).toBeInTheDocument()
  })
})
