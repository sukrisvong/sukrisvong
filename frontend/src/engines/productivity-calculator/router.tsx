import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const CalculatorPage = lazy(() => import("./pages/CalculatorPage"))

export const productivityCalculatorRoutes: RouteObject[] = [
  { index: true, element: <CalculatorPage /> },
]
