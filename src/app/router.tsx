import { lazy } from 'react'
import type { RouteObject } from 'react-router'
import { AppLayout } from './layout/AppLayout'
import { RouteError } from './RouteError'

const HomePage = lazy(() => import('../pages/home/HomePage'))
const MapPage = lazy(() => import('../pages/map/MapPage'))
const RegionPage = lazy(() => import('../pages/region/RegionPage'))
const ItemPage = lazy(() => import('../pages/item/ItemPage'))
const QuizListPage = lazy(() => import('../pages/quiz/QuizListPage'))
const QuizPage = lazy(() => import('../pages/quiz/QuizPage'))
const ProgressPage = lazy(() => import('../pages/progress/ProgressPage'))
const ImageCreditsPage = lazy(() => import('../pages/image-credits/ImageCreditsPage'))
const SourcesPage = lazy(() => import('../pages/sources/SourcesPage'))
const NotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage'))

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
      { path: 'nguon-anh', element: <ImageCreditsPage /> },
      { path: 'nguon-tham-khao', element: <SourcesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
