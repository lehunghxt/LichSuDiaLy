import { FullScreenDialog } from '../../../components/dialog/FullScreenDialog'
import { CloseButton, SectionTabs, SectionTitle, type SectionModalView, TopicContent, TopicList } from './parts'

/** Desktop: toàn màn hình; tiêu đề, các phần và nút Đóng trên một hàng; cột mục bên trái nội dung */
export function DesktopSectionModal({ view }: { view: SectionModalView }) {
  return (
    <FullScreenDialog labelledBy={view.titleId} onClose={view.onClose} initialFocusRef={view.closeRef}>
      <header className="flex items-center gap-4 border-b border-line bg-surface px-6 py-3 shadow-sm">
        <SectionTitle view={view} size="lg" />
        <SectionTabs view={view} layout="wrap" />
        <CloseButton view={view} variant="labelled" />
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)]">
        <aside className="overflow-y-auto border-r border-line bg-surface p-4">
          <TopicList view={view} layout="column" />
        </aside>
        <div ref={view.detailRef} className="min-h-0 overflow-y-auto p-8">
          <TopicContent view={view} />
        </div>
      </div>
    </FullScreenDialog>
  )
}
