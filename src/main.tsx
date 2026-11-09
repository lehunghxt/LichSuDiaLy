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

// Service worker (dist/sw.js, sinh lúc build): lần sau mở nhanh hơn, mất mạng vẫn dùng được. Chỉ bản build
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined)
  })
}
