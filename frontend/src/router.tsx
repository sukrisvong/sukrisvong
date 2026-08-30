import { createBrowserRouter } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
import RootLayout from "./shared/layout/RootLayout"
import { coreRoutes } from "./engines/core/router"
import { productivityCalculatorRoutes } from "./engines/productivity-calculator/router"
import { sortingVisualizerRoutes } from "./engines/algorithm-visualizer/router"

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      ...coreRoutes,
      { path: "productivity_calculator", children: productivityCalculatorRoutes },
      { path: "algorithm_visualizer", children: sortingVisualizerRoutes },
    ],
  },
]

const router = createBrowserRouter(routes)

export default router
