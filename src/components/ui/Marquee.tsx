// Mỗi nửa dải lặp câu chữ vài lần để luôn dài hơn khung (khung rộng nhất: dải chip trên bản đồ desktop)
const COPIES = 4

/** Cờ đỏ sao vàng (tỉ lệ 3:2) */
function VietnamFlag() {
  return (
    <svg aria-hidden viewBox="0 0 30 20" className="h-4 w-6 shrink-0 rounded-[2px] shadow-sm">
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15"
      />
    </svg>
  )
}

/** Dòng chữ chạy ngang nổi thẳng trên bản đồ (không nền), xen giữa là lá cờ Việt Nam. Trình đọc màn hình đọc câu
 *  một lần (dải chạy chỉ để nhìn); máy bật giảm chuyển động thì chữ đứng yên ở giữa */
export function Marquee({ text }: { text: string }) {
  const half = (key: string) => (
    <span key={key} className="flex shrink-0 items-center">
      {Array.from({ length: COPIES }, (_, i) => (
        <span key={i} className="flex items-center gap-3 px-4">
          <VietnamFlag />
          {text}
        </span>
      ))}
    </span>
  )
  return (
    // Chữ đỏ có viền sáng để đọc rõ trên cả biển lẫn đất; hai mép mờ dần
    <div className="pointer-events-none relative overflow-hidden py-1 text-sm font-bold text-red-700 [mask-image:linear-gradient(to_right,transparent,#000_24px,#000_calc(100%-24px),transparent)] [text-shadow:0_0_3px_#fff,0_0_3px_#fff,0_0_6px_#fff]">
      <p className="sr-only">{text}</p>
      <div aria-hidden className="flex w-max animate-marquee whitespace-nowrap motion-reduce:hidden">
        {[half('a'), half('b')]}
      </div>
      <div aria-hidden className="hidden items-center justify-center gap-2 px-3 motion-reduce:flex">
        <VietnamFlag />
        {text}
      </div>
    </div>
  )
}
