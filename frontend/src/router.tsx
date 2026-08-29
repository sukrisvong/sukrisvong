import { createBrowserRouter, Suspense } from "react-router-dom"
import RootLayout from "./shared/layout/RootLayout"
import { coreRoutes } from "./engines/core/router"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Core engine owns the root — home page + engine nav
      ...coreRoutes,

      // Add future engines here, e.g.:
      // {
      //   path: "my-engine",
      //   lazy: () => import("./engines/my-engine/router").then(m => ({ Component: m.default })),
      // },
    ],
  },
])

export default router
