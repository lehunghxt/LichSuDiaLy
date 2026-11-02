import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './app/router'
import './styles/index.css'

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
