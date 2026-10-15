import { render, screen, waitFor } from "@testing-library/react"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { routes } from "../router"

describe("routes", () => {
  it("renders home page at /", async () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/"] })
    render(<RouterProvider router={router} />)
    await waitFor(() => {
      expect(screen.getByText(/SYSTEM_BOOT/)).toBeInTheDocument()
    })
  })

  it("renders productivity calculator at /productivity_calculator", async () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/productivity_calculator"] })
    render(<RouterProvider router={router} />)
    await waitFor(() => {
      expect(screen.getByText("Productivity Calculator")).toBeInTheDocument()
    })
  })

  it("renders algorithm visualizer at /algorithm_visualizer", async () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/algorithm_visualizer"] })
    render(<RouterProvider router={router} />)
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Sort Visualizer" })).toBeInTheDocument()
    })
  })
})
