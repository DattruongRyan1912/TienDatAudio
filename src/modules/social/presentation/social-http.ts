import { NextResponse } from 'next/server'
import type { SocialMutationResult } from '../domain/types'

export function socialMutationResponse(result: SocialMutationResult, successStatus = 200) {
  if (result.ok) return NextResponse.json({ success: true, data: result.post }, { status: successStatus })
  if (result.code === 'NOT_FOUND') return NextResponse.json({ success: false, code: result.code, message: 'Không tìm thấy bài viết' }, { status: 404 })
  if (result.code === 'SLUG_CONFLICT') return NextResponse.json({ success: false, code: result.code, message: 'Slug đã được dùng bởi bài viết khác' }, { status: 409 })
  return NextResponse.json({ success: false, code: result.code, message: 'Bài viết đã được cập nhật ở phiên khác', current: result.current }, { status: 409 })
}

export function socialErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message === 'MONGODB_REQUIRED') return NextResponse.json({ success: false, code: 'MONGODB_REQUIRED', message: 'Cần kết nối MongoDB để quản lý Social Hub' }, { status: 503 })
  if (message.startsWith('VALIDATION:')) return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: message.slice('VALIDATION:'.length).split('|').join('. ') }, { status: 400 })
  console.error('[social-api]', error)
  return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message: 'Không thể xử lý bài viết' }, { status: 500 })
}
