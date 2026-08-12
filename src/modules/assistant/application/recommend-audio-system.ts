import type { CompatibilityAssessment } from '@/modules/knowledge/domain/types'
import type { AssistantPorts } from '../domain/assistant.ports'
import type {
  AssistantAnswer,
  AssistantConversationConstraints,
  AssistantProductFact,
  AssistantRecommendation,
  AssistantSource,
} from '../domain/types'
import { normalizeSearchText } from '../domain/retrieval'

function missingQuestions(constraints: AssistantConversationConstraints) {
  const questions: string[] = []
  if (!constraints.roomSizeM2) questions.push('Không gian cần lắp đặt rộng khoảng bao nhiêu m²?')
  if (!constraints.useCases?.length) questions.push('Bạn ưu tiên nghe nhạc, karaoke, xem phim hay sự kiện?')
  if (!constraints.budgetMax && !constraints.budgetMin) questions.push('Ngân sách dự kiến của bạn là bao nhiêu?')
  return questions
}

function clarification(constraints: AssistantConversationConstraints): AssistantAnswer {
  const questions = missingQuestions(constraints)
  return {
    answerKind: 'clarification',
    intent: 'system_recommendation',
    answer: `Để tư vấn cấu hình có căn cứ, tôi cần thêm ${questions.length} thông tin:\n${questions.map((question) => `- ${question}`).join('\n')}`,
    confidence: 0,
    sources: [],
    actions: [],
    followUpQuestions: questions,
    constraints,
    needsHuman: false,
  }
}

function roomFits(assessment: CompatibilityAssessment, roomSizeM2: number) {
  if (assessment.room.minM2 !== null && roomSizeM2 < assessment.room.minM2) return false
  if (assessment.room.maxM2 !== null && roomSizeM2 > assessment.room.maxM2) return false
  return true
}

function productMatchesComponent(product: AssistantProductFact, requested?: string) {
  if (!requested) return true
  const value = normalizeSearchText([product.name, product.category, product.description].filter(Boolean).join(' '))
  return value.includes(normalizeSearchText(requested))
}

function currentPrice(product: AssistantProductFact) {
  return product.salePrice && product.salePrice > 0 ? product.salePrice : product.price && product.price > 0 ? product.price : null
}

function compatibilitySource(assessment: CompatibilityAssessment): AssistantSource {
  return {
    id: assessment.id,
    type: 'compatibility',
    title: `Đánh giá phối ghép ${assessment.componentIds.join(' + ')}`,
    excerpt: assessment.reason,
    authority: 90,
    updatedAt: assessment.updatedAt,
  }
}

function recommendation(product: AssistantProductFact, assessment: CompatibilityAssessment, graphScore = 0): AssistantRecommendation {
  const price = currentPrice(product)
  const reasons = [assessment.reason]
  if (product.inStock === true) reasons.push('Đang hiển thị còn hàng trên website')
  if (assessment.room.minM2 !== null || assessment.room.maxM2 !== null) {
    reasons.push(`Đánh giá cho phòng ${assessment.room.minM2 ?? 0}–${assessment.room.maxM2 ?? 'không giới hạn'} m²`)
  }
  return {
    productId: product.id,
    name: product.name,
    url: `/san-pham/${product.slug}`,
    ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
    price,
    inStock: product.inStock,
    score: Math.min(1, 0.85 + graphScore * 0.15),
    reasons,
  }
}

export async function recommendAudioSystem(
  constraints: AssistantConversationConstraints,
  ports: AssistantPorts,
): Promise<AssistantAnswer> {
  const questions = missingQuestions(constraints)
  if (questions.length) return clarification(constraints)
  if (!ports.advisorEnabled || !ports.listVerifiedCompatibility) {
    return {
      answerKind: 'fallback', intent: 'system_recommendation',
      answer: 'Chức năng tư vấn cấu hình đang ở chế độ kiểm chứng. Tôi đã ghi nhận nhu cầu của bạn; nhân viên Tiến Đạt Audio sẽ xác nhận cấu hình phù hợp trước khi báo giá.',
      confidence: 0, sources: [], constraints,
      actions: [{ type: 'contact_form', label: 'Gửi cấu hình cần tư vấn', href: '/contact' }],
      needsHuman: true,
    }
  }

  const [assessments, products] = await Promise.all([ports.listVerifiedCompatibility(), ports.listProducts()])
  const useCases = new Set(constraints.useCases || [])
  const eligible = assessments.filter((assessment) =>
    assessment.reviewStatus === 'verified'
    && roomFits(assessment, constraints.roomSizeM2!)
    && assessment.useCases.some((useCase) => useCases.has(useCase as NonNullable<AssistantConversationConstraints['useCases']>[number])),
  )
  const eligibleProductIds = new Set(eligible.flatMap((assessment) => assessment.componentIds))
  const productMap = new Map(products.filter((product) => eligibleProductIds.has(product.id)).map((product) => [product.id, product]))

  let graphScores = new Map<string, number>()
  if (ports.graphMode !== 'off' && ports.queryGraphRecommendations && eligible.length) {
    try {
      const graph = await ports.queryGraphRecommendations({ constraints, assessmentIds: eligible.map((item) => item.id), productIds: Array.from(productMap.keys()) })
      if (ports.graphMode === 'public') {
        graphScores = new Map(graph.flatMap((item) => item.productIds.map((id) => [id, item.score] as const)))
      }
    } catch {
      graphScores = new Map()
    }
  }

  const recommendations = eligible.flatMap((assessment) => assessment.componentIds.map((productId) => {
    const product = productMap.get(productId)
    if (!product || !productMatchesComponent(product, constraints.requestedComponent)) return null
    const price = currentPrice(product)
    if (constraints.budgetMax && price && price > constraints.budgetMax) return null
    if (constraints.budgetMin && price && price < constraints.budgetMin * 0.2) return null
    return recommendation(product, assessment, graphScores.get(productId) || 0)
  })).filter((value): value is AssistantRecommendation => Boolean(value))

  const deduplicated = Array.from(new Map(recommendations.map((item) => [item.productId, item])).values())
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'vi'))
    .slice(0, 6)
  if (!deduplicated.length) {
    return {
      answerKind: 'fallback', intent: 'system_recommendation',
      answer: 'Kho tri thức hiện chưa có đánh giá phối ghép đã được duyệt phù hợp đầy đủ với diện tích, nhu cầu và ngân sách này. Tôi sẽ không tự suy đoán một cấu hình.',
      confidence: 0, sources: [], constraints,
      actions: [{ type: 'contact_form', label: 'Nhờ kỹ thuật viên tư vấn', href: '/contact' }],
      needsHuman: true,
    }
  }

  const sourceMap = new Map(eligible.map((assessment) => [assessment.id, compatibilitySource(assessment)]))
  return {
    answerKind: 'exact',
    intent: 'system_recommendation',
    answer: `Tôi tìm thấy ${deduplicated.length} sản phẩm thuộc các đánh giá phối ghép đã được duyệt. Giá và trạng thái hàng bên dưới được đọc lại trực tiếp từ catalog; số lượng tồn kho thực tế vẫn cần nhân viên xác nhận.`,
    confidence: 0.9,
    sources: Array.from(sourceMap.values()).slice(0, 5),
    recommendations: deduplicated,
    actions: [{ type: 'contact_form', label: 'Xác nhận cấu hình và tồn kho', href: '/contact' }],
    constraints,
    needsHuman: true,
  }
}
