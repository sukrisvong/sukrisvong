import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import RootLayout from "../RootLayout"

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, Outlet: () => <div data-testid="outlet" /> }
})

describe("RootLayout", () => {
  it("renders the outlet", () => {
    render(
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    )
    expect(screen.getByTestId("outlet")).toBeInTheDocument()
  })
})
