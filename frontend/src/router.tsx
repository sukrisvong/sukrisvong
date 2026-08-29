import { createBrowserRouter } from "react-router-dom"
import RootLayout from "./shared/layout/RootLayout"
import { coreRoutes } from "./engines/core/router"
import { productivityCalculatorRoutes } from "./engines/productivity-calculator/router"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      ...coreRoutes,
      {
        path: "productivity-calculator",
        children: productivityCalculatorRoutes,
      },
    ],
  },
])

export default router
