import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { ProgressProvider } from '../../features/progress/ProgressProvider'
import { LoadingState } from '../ui/states'
import { Header } from './Header'

export function AppLayout() {
  return (
    <ProgressProvider>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[1200] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
        >
          Bỏ qua tới nội dung chính
        </a>
        <Header />
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="border-t border-line bg-surface px-4 py-5 text-center text-sm text-muted">
          Nội dung học tập bám theo SGK Lịch sử và Địa lí 4. Tiến độ chỉ lưu trên trình duyệt này.
        </footer>
      </div>
    </ProgressProvider>
  )
}
