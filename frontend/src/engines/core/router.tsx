import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const HomePage = lazy(() => import("./pages/HomePage")) // oxlint-disable-line only-export-components

export const coreRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
]
