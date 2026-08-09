import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { publishSocialPost } from '@/modules/social/application/social-post-service'
import { refreshPublishedSocialPost } from '@/modules/social/application/social-publishing'
import { socialErrorResponse, socialMutationResponse } from '@/modules/social/presentation/social-http'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorizedResponse()
  try {
    const body = await request.json() as { version?: number }
    const result = await publishSocialPost((await params).id, Number(body.version) || 1, session.username)
    if (result.ok) await refreshPublishedSocialPost(result.post)
    return socialMutationResponse(result)
  } catch (error) {
    return socialErrorResponse(error)
  }
}
