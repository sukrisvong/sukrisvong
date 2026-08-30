import { lazy } from "react"
import type { RouteObject } from "react-router-dom"

const AlgorithmVisualizerPage = lazy(() => import("./pages/AlgorithmVisualizerPage")) // oxlint-disable-line only-export-components

export const algorithmVisualizerRoutes: RouteObject[] = [
  { index: true, element: <AlgorithmVisualizerPage /> },
]
