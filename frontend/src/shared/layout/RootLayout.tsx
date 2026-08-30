import { Suspense } from "react"
import { Outlet } from "react-router-dom"

export default function RootLayout() {
  return (
    <>
      <nav>
        {/* Engine nav links will go here */}
      </nav>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </>
  )
}
