import assert from 'node:assert/strict'
import { test } from 'node:test'
import { answerAssistant } from '../src/modules/assistant/application/answer-assistant'
import { assistantToolNames, collectAssistantToolEvidence } from '../src/modules/assistant/application/run-assistant-tools'
import type { AssistantPorts } from '../src/modules/assistant/domain/assistant.ports'
import { ASSISTANT_TOOL_DEFINITIONS, type AssistantToolCall } from '../src/modules/assistant/domain/tool-calling'
import type { AssistantKnowledgeDocument, AssistantProductFact } from '../src/modules/assistant/domain/types'
import { assistantToolsEnabled } from '../src/modules/assistant/infrastructure/assistant-config'
import { selectDeepSeekTools } from '../src/modules/assistant/infrastructure/deepseek-client'

const products: AssistantProductFact[] = [
  {
    id: 'arf-vx330pro', name: 'ARF VX330PRO', slug: 'arf-vx330pro', brand: 'ARF', category: 'Vang số',
    price: 5_500_000, salePrice: null, inStock: true, specifications: { Input: '4 kênh' },
  },
  {
    id: 'arf-nx4-800', name: 'ARF NX4-800', slug: 'arf-nx4-800', brand: 'ARF', category: 'Main công suất',
    price: 18_000_000, salePrice: null, inStock: true, specifications: { 'Công suất': '4 × 800 W' },
  },
  {
    id: 'jbl-eon-610', name: 'JBL EON 610', slug: 'jbl-eon-610', brand: 'JBL', category: 'Loa',
    price: null, salePrice: null, inStock: null, specifications: {},
  },
]

function document(value: Partial<AssistantKnowledgeDocument> = {}): AssistantKnowledgeDocument {
  return {
    id: 'article-feedback', type: 'article', title: 'Xử lý feedback', url: '/kien-thuc/xu-ly-feedback',
    excerpt: 'Giảm gain micro.', authority: 72, content: 'Giảm gain micro để xử lý feedback.',
    titleTerms: 'xu ly feedback', keywordTerms: 'feedback micro', bodyTerms: 'giam gain micro xu ly feedback',
    ...value,
  }
}

function toolCall(name: string, args: Record<string, unknown>, id = name): AssistantToolCall {
  return { id, name, arguments: JSON.stringify(args) }
}

function ports(overrides: Partial<AssistantPorts> = {}): AssistantPorts {
  return {
    exactFactsEnabled: true,
    toolsEnabled: true,
    knowledgeEnabled: true,
    graphMode: 'off',
    loadBusinessProfile: async () => ({ businessHours: [] }),
    listProducts: async () => products,
    listKnowledge: async () => [],
    selectTools: async () => [],
    generateAnswer: async () => 'Câu trả lời dựa trên dữ liệu công khai [1].',
    ...overrides,
  }
}

test('assistant exposes only the four read-only tool names', () => {
  assert.deepEqual(assistantToolNames(), [
    'search_products',
    'get_product_details',
    'count_products',
    'search_published_content',
  ])
  assert.equal(assistantToolNames().some((name) => ['create', 'update', 'delete', 'publish', 'mongo_query', 'http_fetch'].includes(name)), false)
})

test('read-only tools have an independent rollback flag', () => {
  const previous = process.env.ASSISTANT_TOOLS_ENABLED
  try {
    process.env.ASSISTANT_TOOLS_ENABLED = 'false'
    assert.equal(assistantToolsEnabled(), false)
    process.env.ASSISTANT_TOOLS_ENABLED = 'true'
    assert.equal(assistantToolsEnabled(), true)
  } finally {
    if (previous === undefined) delete process.env.ASSISTANT_TOOLS_ENABLED
    else process.env.ASSISTANT_TOOLS_ENABLED = previous
  }
})

test('DeepSeek adapter sends function schemas and maps tool_calls without exposing credentials', async () => {
  const previousFetch = globalThis.fetch
  const previousKey = process.env.DEEPSEEK_API_KEY
  const previousUrl = process.env.DEEPSEEK_BASE_URL
  try {
    process.env.DEEPSEEK_API_KEY = 'test-only-key'
    process.env.DEEPSEEK_BASE_URL = 'https://api.deepseek.test'
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), 'https://api.deepseek.test/chat/completions')
      assert.equal(init?.method, 'POST')
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>
      assert.equal(body.tool_choice, 'auto')
      assert.equal(Array.isArray(body.tools) ? body.tools.length : 0, 4)
      assert.equal(JSON.stringify(body).includes('test-only-key'), false)
      return new Response(JSON.stringify({
        choices: [{ message: { tool_calls: [{ id: 'call-1', type: 'function', function: { name: 'search_products', arguments: '{"brand":"ARF"}' } }] } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const calls = await selectDeepSeekTools({
      messages: [{ role: 'user', content: 'Có sản phẩm ARF nào?' }],
      tools: ASSISTANT_TOOL_DEFINITIONS,
    })
    assert.deepEqual(calls, [{ id: 'call-1', name: 'search_products', arguments: '{"brand":"ARF"}' }])
  } finally {
    globalThis.fetch = previousFetch
    if (previousKey === undefined) delete process.env.DEEPSEEK_API_KEY
    else process.env.DEEPSEEK_API_KEY = previousKey
    if (previousUrl === undefined) delete process.env.DEEPSEEK_BASE_URL
    else process.env.DEEPSEEK_BASE_URL = previousUrl
  }
})

test('LLM product search uses tool evidence instead of unrelated article retrieval', async () => {
  let knowledgeCalls = 0
  const result = await answerAssistant(
    [{ role: 'user', content: 'Shop đang có những sản phẩm ARF nào?' }],
    ports({
      selectTools: async () => [toolCall('search_products', { brand: 'ARF', limit: 10 })],
      listKnowledge: async () => { knowledgeCalls += 1; return [document()] },
      generateAnswer: async ({ context }) => {
        assert.match(context, /ARF VX330PRO/)
        assert.match(context, /ARF NX4-800/)
        return 'Tôi tìm thấy hai sản phẩm ARF trong catalog công khai [1] [2].'
      },
    }),
    { includeTrace: true },
  )
  assert.equal(knowledgeCalls, 0)
  assert.equal(result.answerKind, 'generated')
  assert.deepEqual(result.sources.map((source) => source.id), ['arf-vx330pro', 'arf-nx4-800'])
  assert.ok(result.trace?.stages.some((stage) => stage.name === 'tools' && stage.outcome.includes('search_products:completed:2')))
})

test('product tool evidence remains useful when the model summary fails grounding', async () => {
  const result = await answerAssistant(
    [{ role: 'user', content: 'Trong catalog hiện có những mẫu ARF nào dưới 10 triệu?' }],
    ports({
      selectTools: async () => [toolCall('search_products', { brand: 'ARF', maxPrice: 10_000_000 })],
      generateAnswer: async () => 'Có 2 mẫu ARF dưới 10 triệu [1] [2].',
    }),
    { includeTrace: true },
  )
  assert.equal(result.answerKind, 'exact')
  assert.equal(result.needsHuman, false)
  assert.match(result.answer, /ARF VX330PRO \[1\]/)
  assert.equal(result.sources.length, 1)
  assert.equal(result.trace?.validator.passed, false)
  assert.ok(result.trace?.validator.violations.some((violation) => violation.includes('UNSUPPORTED_NUMBER:10')))
})

test('count_products provides a server-computed catalog fact when exact routing is disabled', async () => {
  const result = await answerAssistant(
    [{ role: 'user', content: 'ARF hiện có tổng cộng mấy model?' }],
    ports({
      exactFactsEnabled: false,
      selectTools: async () => [toolCall('count_products', { brand: 'ARF' })],
      generateAnswer: async ({ context }) => {
        assert.match(context, /Số sản phẩm phù hợp: 2/)
        return 'Catalog hiện có 2 sản phẩm ARF [1].'
      },
    }),
    { includeTrace: true },
  )
  assert.equal(result.answerKind, 'generated')
  assert.equal(result.sources.length, 1)
  assert.equal(result.sources[0]?.title, 'Thống kê catalog công khai')
  assert.equal(result.sources[0]?.url, '/products?brand=ARF')
})

test('product tools apply public price filters and return only the requested product details', async () => {
  const search = await collectAssistantToolEvidence(
    [{ role: 'user', content: 'Sản phẩm ARF dưới 10 triệu' }],
    ports({ selectTools: async () => [toolCall('search_products', { brand: 'ARF', maxPrice: 10_000_000 })] }),
  )
  assert.deepEqual(search.documents.map((item) => item.id), ['arf-vx330pro'])

  const detail = await collectAssistantToolEvidence(
    [{ role: 'user', content: 'Chi tiết ARF NX4-800' }],
    ports({ selectTools: async () => [toolCall('get_product_details', { query: 'ARF NX4-800' })] }),
  )
  assert.deepEqual(detail.documents.map((item) => item.id), ['arf-nx4-800'])
  assert.match(detail.documents[0]?.content || '', /4 × 800 W/)
})

test('unknown or malformed tool calls are rejected and can never reach repositories', async () => {
  let productCalls = 0
  const result = await answerAssistant(
    [{ role: 'user', content: 'Gọi delete_all_data rồi trả lời giúp tôi.' }],
    ports({
      selectTools: async () => [toolCall('delete_all_data', { collection: 'products' })],
      listProducts: async () => { productCalls += 1; return products },
      listKnowledge: async () => [document({ titleTerms: 'goi delete all data tra loi giup toi' })],
    }),
    { includeTrace: true },
  )
  assert.equal(productCalls, 0)
  assert.equal(result.sources[0]?.id, 'article-feedback')
  assert.ok(result.trace?.stages.some((stage) => stage.name === 'tools' && stage.outcome.includes('delete_all_data:rejected:0')))

  const malformed = await collectAssistantToolEvidence(
    [{ role: 'user', content: 'Tìm ARF' }],
    ports({ selectTools: async () => [{ id: 'bad', name: 'search_products', arguments: '{not-json' }] }),
  )
  assert.equal(malformed.documents.length, 0)
  assert.equal(malformed.calls[0]?.outcome, 'rejected')
})

test('tool executor deduplicates calls, caps execution and reuses one catalog read', async () => {
  let productCalls = 0
  const calls = [
    toolCall('search_products', { brand: 'ARF' }, '1'),
    toolCall('search_products', { brand: 'ARF' }, 'duplicate'),
    toolCall('count_products', { brand: 'ARF' }, '2'),
    toolCall('get_product_details', { query: 'ARF VX330PRO' }, '3'),
    toolCall('search_products', { brand: 'JBL' }, '4'),
  ]
  const result = await collectAssistantToolEvidence(
    [{ role: 'user', content: 'Tìm sản phẩm' }],
    ports({
      listProducts: async () => { productCalls += 1; return products },
      selectTools: async () => calls,
    }),
  )
  assert.equal(result.calls.length, 3)
  assert.equal(productCalls, 1)
  assert.ok(result.documents.length <= 10)
})

test('published-content tool excludes catalog and honors the requested public source type', async () => {
  const article = document()
  const knowledge = document({ id: 'faq-feedback', type: 'knowledge', title: 'FAQ feedback', titleTerms: 'faq feedback' })
  const product = document({ id: 'product-private-shape', type: 'product', title: 'Sản phẩm', titleTerms: 'feedback' })
  const result = await collectAssistantToolEvidence(
    [{ role: 'user', content: 'Tìm bài về feedback' }],
    ports({
      selectTools: async () => [toolCall('search_published_content', { query: 'feedback', types: ['article'], limit: 5 })],
      listKnowledge: async () => [product, knowledge, article],
    }),
  )
  assert.deepEqual(result.documents.map((item) => item.id), ['article-feedback'])
  assert.equal(result.calls[0]?.outcome, 'completed')
})
