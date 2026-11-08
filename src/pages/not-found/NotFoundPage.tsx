import { Link } from 'react-router'
import { EmptyState } from '../../components/ui/states'

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Không tìm thấy trang em cần"
      description="Đường dẫn có thể đã bị gõ sai hoặc nội dung chưa có."
      action={
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-white hover:bg-primary-dark"
        >
          Về trang chủ
        </Link>
      }
    />
  )
}
