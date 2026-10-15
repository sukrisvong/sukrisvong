import { render, screen } from "@testing-library/react"
import HUD from "../HUD"
import { themeFor } from "../../themes/index"

const theme = themeFor("cyberpunk")

describe("HUD", () => {
  it("displays score", () => {
    render(<HUD score={42} lives={3} theme={theme} />)
    expect(screen.getByLabelText("score")).toHaveTextContent("SCORE: 42")
  })

  it("displays lives", () => {
    render(<HUD score={0} lives={2} theme={theme} />)
    expect(screen.getByLabelText("lives")).toBeInTheDocument()
  })

  it("renders with zero lives", () => {
    render(<HUD score={0} lives={0} theme={theme} />)
    expect(screen.getByLabelText("lives")).toBeInTheDocument()
  })
})
