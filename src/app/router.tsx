import { lazy } from 'react'
import type { RouteObject } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { RouteError } from './RouteError'

const HomePage = lazy(() => import('../pages/HomePage'))
const MapPage = lazy(() => import('../pages/MapPage'))
const RegionPage = lazy(() => import('../pages/RegionPage'))
const ItemPage = lazy(() => import('../pages/ItemPage'))
const QuizListPage = lazy(() => import('../pages/QuizListPage'))
const QuizPage = lazy(() => import('../pages/QuizPage'))
const ProgressPage = lazy(() => import('../pages/ProgressPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'ban-do', element: <MapPage /> },
      { path: 'ban-do/:regionId', element: <MapPage /> },
      { path: 'vung/:regionId', element: <RegionPage /> },
      { path: 'dia-danh/:itemId', element: <ItemPage /> },
      { path: 'on-tap', element: <QuizListPage /> },
      { path: 'on-tap/:quizId', element: <QuizPage /> },
      { path: 'tien-do', element: <ProgressPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
