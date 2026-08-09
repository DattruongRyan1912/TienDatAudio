import { NextResponse } from 'next/server'
import type { ContentMutationResult } from './content-types'

export function contentMutationResponse(result: ContentMutationResult, successStatus = 200) {
  if (result.ok) return NextResponse.json({ success: true, data: result.post }, { status: successStatus })
  if (result.code === 'NOT_FOUND') return NextResponse.json({ success: false, message: 'Không tìm thấy bài viết' }, { status: 404 })
  if (result.code === 'SLUG_CONFLICT') return NextResponse.json({ success: false, message: 'Slug đã được dùng bởi bài viết khác' }, { status: 409 })
  return NextResponse.json({ success: false, message: 'Bài viết đã được cập nhật ở phiên khác', current: result.current }, { status: 409 })
}

export function contentErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message === 'MONGODB_REQUIRED') {
    return NextResponse.json({ success: false, message: 'Cần kết nối MongoDB để quản lý bài viết' }, { status: 503 })
  }
  if (message.startsWith('VALIDATION:')) {
    return NextResponse.json({ success: false, message: message.slice('VALIDATION:'.length).split('|').join('. ') }, { status: 400 })
  }
  console.error('[content-api]', error)
  return NextResponse.json({ success: false, message: 'Không thể xử lý bài viết' }, { status: 500 })
}
