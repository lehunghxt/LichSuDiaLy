import { Link } from 'react-router'
import { ErrorState } from '../components/ui/states'

export function RouteError() {
  return (
    <div className="mx-auto max-w-xl p-6">
      <ErrorState
        title="Ôi, có lỗi xảy ra rồi!"
        description="Em hãy tải lại trang hoặc quay về trang chủ nhé."
        onRetry={() => window.location.reload()}
        action={
          <Link to="/" className="font-semibold text-primary underline">
            Về trang chủ
          </Link>
        }
      />
    </div>
  )
}
