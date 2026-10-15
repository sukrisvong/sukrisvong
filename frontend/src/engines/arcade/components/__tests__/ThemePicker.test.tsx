import { render, screen, fireEvent } from "@testing-library/react"
import ThemePicker from "../ThemePicker"
import { themeFor } from "../../themes/index"

const theme = themeFor("cyberpunk")

describe("ThemePicker", () => {
  it("renders theme buttons", () => {
    render(<ThemePicker current="cyberpunk" onChange={vi.fn()} theme={theme} />)
    expect(screen.getByText("Cyberpunk")).toBeInTheDocument()
    expect(screen.getByText("Medieval")).toBeInTheDocument()
  })

  it("marks current theme as pressed", () => {
    render(<ThemePicker current="cyberpunk" onChange={vi.fn()} theme={theme} />)
    expect(screen.getByText("Cyberpunk")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Medieval")).toHaveAttribute("aria-pressed", "false")
  })

  it("calls onChange when a theme is clicked", () => {
    const onChange = vi.fn()
    render(<ThemePicker current="cyberpunk" onChange={onChange} theme={theme} />)
    fireEvent.click(screen.getByText("Medieval"))
    expect(onChange).toHaveBeenCalledWith("medieval")
  })
})
