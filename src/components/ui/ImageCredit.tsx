import type { WebImage } from '../../types/content'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const
const linkClass = 'underline decoration-dotted underline-offset-2 hover:text-primary'

/** Ghi nguồn theo TASL: tác giả, giấy phép, trang gốc trên Wikimedia Commons */
export function ImageCredit({ image }: { image: WebImage }) {
  const { author, authorUrl, license, licenseUrl, sourceUrl } = image.attribution
  return (
    <span className="text-xs text-muted">
      Ảnh:{' '}
      {authorUrl ? (
        <a href={authorUrl} {...external} className={linkClass}>
          {author}
        </a>
      ) : (
        author
      )}
      ,{' '}
      {licenseUrl ? (
        <a href={licenseUrl} {...external} className={linkClass}>
          {license}
        </a>
      ) : (
        license
      )}
      , qua{' '}
      <a href={sourceUrl} {...external} className={linkClass}>
        Wikimedia Commons
      </a>
    </span>
  )
}
