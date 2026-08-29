import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const HomePage = lazy(() => import("./pages/HomePage"))

export const coreRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
]
