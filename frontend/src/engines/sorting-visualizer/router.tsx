import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const SortingVisualizerPage = lazy(() => import("./pages/SortingVisualizerPage")) // oxlint-disable-line only-export-components

export const sortingVisualizerRoutes: RouteObject[] = [
  { index: true, element: <SortingVisualizerPage /> },
]
