import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const ArcadePage = lazy(() => import("./pages/ArcadePage")) // oxlint-disable-line only-export-components

export const arcadeRoutes: RouteObject[] = [
  { index: true, element: <ArcadePage /> },
]
