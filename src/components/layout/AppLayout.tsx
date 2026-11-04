import { Suspense } from 'react'
import { Link, Outlet, useMatch } from 'react-router'
import { ProgressProvider } from '../../features/progress/ProgressProvider'
import { LoadingState } from '../ui/states'
import { Header } from './Header'

export function AppLayout() {
  // Trang bản đồ chiếm trọn màn hình: không header/footer, điều hướng nằm trong khung thông tin bên phải
  const fullScreen = useMatch('/ban-do/*') !== null
  if (fullScreen) {
    return (
      <ProgressProvider>
        <div className="flex min-h-dvh flex-col lg:h-dvh">
          <main id="main" className="min-h-0 flex-1">
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </ProgressProvider>
    )
  }
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
        <main id="main" className="mx-auto w-full max-w-[1680px] flex-1 px-4 py-5 lg:px-6">
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="border-t border-line bg-surface px-4 py-5 text-center text-sm text-muted">
          Nội dung học tập bám theo SGK Lịch sử và Địa lí 4. Tiến độ chỉ lưu trên trình duyệt này.{' '}
          <Link to="/nguon-anh" className="font-semibold text-primary hover:underline">
            Nguồn ảnh
          </Link>
        </footer>
      </div>
    </ProgressProvider>
  )
}
