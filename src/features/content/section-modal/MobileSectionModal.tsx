import { BottomSheet } from '../../../components/sheet/BottomSheet'
import { CloseButton, SectionTabs, SectionTitle, type SectionModalView, TopicContent, TopicList } from './parts'

/** Điện thoại: bottom sheet gần trọn màn hình, vẫn thấy bản đồ phía trên. Phần và mục là hàng vuốt ngang */
export function MobileSectionModal({ view }: { view: SectionModalView }) {
  return (
    <BottomSheet labelledBy={view.titleId} onClose={view.onClose} initialFocusRef={view.closeRef} size="full">
      <header className="flex flex-col gap-2 border-b border-line bg-surface px-4 pb-2 shadow-sm">
        <div className="flex items-center gap-3">
          <SectionTitle view={view} size="md" />
          <CloseButton view={view} variant="icon" />
        </div>
        <SectionTabs view={view} layout="scroll" className="-mx-4 px-4" />
      </header>
      <div className="shrink-0 border-b border-line bg-surface p-2">
        <TopicList view={view} layout="row" />
      </div>
      <div ref={view.detailRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        <TopicContent view={view} />
      </div>
    </BottomSheet>
  )
}
