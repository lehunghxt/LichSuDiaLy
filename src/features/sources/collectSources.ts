import type { ContentItem } from "../../types/content";

type ItemWithSources = Pick<ContentItem, "id" | "title" | "sources">;

export interface RegionSources {
  regionId: string;
  regionName: string;
  items: ItemWithSources[];
}

export interface SourceRow {
  title: string;
  url?: string;
  /** Các trang sách được dẫn, tăng dần, không trùng */
  pages: number[];
  regionNames: string[];
  items: { id: string; title: string; regionId: string }[];
}

/** Số bài trong tên nguồn "…, Bài N. …"; nguồn không phải bài SGK xếp sau cùng */
const lessonOf = (title: string) =>
  Number(/Bài (\d+)\./.exec(title)?.[1] ?? Infinity);

/** Gom các nguồn tham khảo của mọi mục nội dung thành bảng thống kê theo từng nguồn */
export function collectSources(regions: RegionSources[]): SourceRow[] {
  const rows = new Map<string, SourceRow>();
  for (const region of regions) {
    for (const item of region.items) {
      for (const s of item.sources) {
        let row = rows.get(s.title);
        if (!row) {
          row = {
            title: s.title,
            url: s.url,
            pages: [],
            regionNames: [],
            items: [],
          };
          rows.set(s.title, row);
        }
        if (s.page !== undefined && !row.pages.includes(s.page))
          row.pages.push(s.page);
        if (!row.regionNames.includes(region.regionName))
          row.regionNames.push(region.regionName);
        if (!row.items.some((i) => i.id === item.id))
          row.items.push({
            id: item.id,
            title: item.title,
            regionId: region.regionId,
          });
      }
    }
  }
  for (const row of rows.values()) row.pages.sort((a, b) => a - b);
  return [...rows.values()].sort(
    (a, b) =>
      lessonOf(a.title) - lessonOf(b.title) ||
      a.title.localeCompare(b.title, "vi"),
  );
}
