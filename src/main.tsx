import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// إنشاء الراوتر
const router = createRouter({ routeTree })

// تسجيل الراوتر لأنواع TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// نقطة الدخول
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
