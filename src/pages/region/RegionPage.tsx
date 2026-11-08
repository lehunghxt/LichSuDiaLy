import { Navigate, useLocation, useParams } from 'react-router'

/** Link cũ /vung/<vùng>?chu-de=…: nội dung chủ đề giờ mở dạng modal trên trang bản đồ */
export default function RegionPage() {
  const { regionId = '' } = useParams()
  const { search } = useLocation()
  return <Navigate replace to={`/ban-do/${regionId}${search}`} />
}
