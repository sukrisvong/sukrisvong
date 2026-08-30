import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const CalculatorPage = lazy(() => import("./pages/CalculatorPage")) // oxlint-disable-line only-export-components

export const productivityCalculatorRoutes: RouteObject[] = [
  { index: true, element: <CalculatorPage /> },
]
