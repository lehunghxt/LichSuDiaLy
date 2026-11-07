import { FullScreenDialog } from '../../../components/dialog/FullScreenDialog'
import { CloseButton, SectionTabs, SectionTitle, type SectionModalView, TopicContent, TopicList } from './parts'

/** Máy tính bảng: toàn màn hình; các phần là hàng vuốt ngang dưới tiêu đề, cột mục hẹp bên trái nội dung */
export function TabletSectionModal({ view }: { view: SectionModalView }) {
  return (
    <FullScreenDialog labelledBy={view.titleId} onClose={view.onClose} initialFocusRef={view.closeRef}>
      <header className="flex flex-col gap-3 border-b border-line bg-surface px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <SectionTitle view={view} size="lg" />
          <CloseButton view={view} variant="labelled" />
        </div>
        <SectionTabs view={view} layout="scroll" className="-mx-6 px-6" />
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)]">
        <aside className="overflow-y-auto border-r border-line bg-surface p-3">
          <TopicList view={view} layout="column" />
        </aside>
        <div ref={view.detailRef} className="min-h-0 overflow-y-auto p-8">
          <TopicContent view={view} />
        </div>
      </div>
    </FullScreenDialog>
  )
}
