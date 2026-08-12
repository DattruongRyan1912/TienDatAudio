import type { AssistantMessage } from './types'

export const ASSISTANT_TOOL_NAMES = [
  'search_products',
  'get_product_details',
  'count_products',
  'search_published_content',
] as const

export type AssistantToolName = typeof ASSISTANT_TOOL_NAMES[number]

export type AssistantToolDefinition = {
  type: 'function'
  function: {
    name: AssistantToolName
    description: string
    parameters: Record<string, unknown>
  }
}

export type AssistantToolCall = {
  id: string
  name: string
  arguments: string
}

export type AssistantToolSelectorInput = {
  messages: AssistantMessage[]
  tools: AssistantToolDefinition[]
}

const productFilterProperties = {
  query: { type: 'string', maxLength: 160, description: 'Tên, model hoặc từ khóa sản phẩm.' },
  brand: { type: 'string', maxLength: 120, description: 'Tên hoặc mã thương hiệu công khai.' },
  category: { type: 'string', maxLength: 120, description: 'Tên hoặc mã danh mục công khai.' },
  minPrice: { type: 'number', minimum: 0, description: 'Giá hiển thị tối thiểu bằng VND.' },
  maxPrice: { type: 'number', minimum: 0, description: 'Giá hiển thị tối đa bằng VND.' },
  availability: {
    type: 'string',
    enum: ['available', 'unavailable', 'unknown', 'all'],
    description: 'Trạng thái đang bán công khai; mặc định all.',
  },
}

export const ASSISTANT_TOOL_DEFINITIONS: AssistantToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Tìm tối đa 10 sản phẩm trong catalog công khai theo tên, thương hiệu, danh mục, giá hiển thị và trạng thái bán.',
      parameters: {
        type: 'object',
        properties: {
          ...productFilterProperties,
          limit: { type: 'integer', minimum: 1, maximum: 10, description: 'Số kết quả, mặc định 5.' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_details',
      description: 'Lấy dữ liệu công khai của một sản phẩm khi đã biết tên hoặc slug. Nếu tên chưa đủ rõ, công cụ trả các ứng viên để hỏi lại.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', minLength: 2, maxLength: 160, description: 'Tên đầy đủ, model hoặc slug sản phẩm.' },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'count_products',
      description: 'Đếm sản phẩm trong catalog công khai theo bộ lọc. Dùng cho câu hỏi tổng số sản phẩm, model hoặc sản phẩm theo thương hiệu/danh mục.',
      parameters: {
        type: 'object',
        properties: productFilterProperties,
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_published_content',
      description: 'Tìm bài viết, FAQ, claim hoặc nội dung kho tri thức đã được xuất bản/kiểm duyệt. Không truy cập draft hoặc dữ liệu admin.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', minLength: 2, maxLength: 200, description: 'Chủ đề hoặc câu hỏi cần tìm.' },
          types: {
            type: 'array',
            items: { type: 'string', enum: ['article', 'knowledge', 'claim'] },
            maxItems: 3,
            description: 'Loại nguồn cần tìm; bỏ trống để tìm tất cả nội dung đã duyệt.',
          },
          limit: { type: 'integer', minimum: 1, maximum: 5, description: 'Số kết quả, mặc định 5.' },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
]

export function isAssistantToolName(value: string): value is AssistantToolName {
  return (ASSISTANT_TOOL_NAMES as readonly string[]).includes(value)
}
