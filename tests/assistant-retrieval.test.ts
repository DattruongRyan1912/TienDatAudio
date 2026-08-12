import assert from 'node:assert/strict'
import { test } from 'node:test'
import { answerAssistant, normalizeAssistantMessages } from '../src/modules/assistant/application/answer-assistant'
import { normalizeSearchText, queryTerms, retrieveKnowledge } from '../src/modules/assistant/domain/retrieval'
import type { AssistantKnowledgeDocument } from '../src/modules/assistant/domain/types'

function document(value: Partial<AssistantKnowledgeDocument>): AssistantKnowledgeDocument {
  return {
    id: 'doc', type: 'article', title: 'Tài liệu', url: '/kien-thuc/tai-lieu', excerpt: '', content: '',
    titleTerms: '', keywordTerms: '', bodyTerms: '', ...value,
  }
}

test('assistant search normalizes Vietnamese text and removes generic words', () => {
  assert.equal(normalizeSearchText('Loa phòng 20m² ở Quảng Ngãi'), 'loa phong 20m o quang ngai')
  assert.deepEqual(queryTerms('Tôi muốn chọn loa karaoke cho phòng 20m²'), ['chon', 'loa', 'karaoke', 'phong', '20m'])
})

test('assistant retrieval ranks title and keyword matches above body-only matches', () => {
  const result = retrieveKnowledge('loa karaoke', [
    document({ id: 'body', title: 'Âm thanh', bodyTerms: 'huong dan loa karaoke' }),
    document({ id: 'title', title: 'Loa karaoke', titleTerms: 'loa karaoke' }),
  ])
  assert.deepEqual(result.map((item) => item.id), ['title', 'body'])
})

test('assistant message validation limits history and requires a final user message', () => {
  const messages = normalizeAssistantMessages([
    { role: 'user', content: 'Một' }, { role: 'assistant', content: 'Hai' }, { role: 'user', content: 'Ba' },
    { role: 'assistant', content: 'Bốn' }, { role: 'user', content: 'Năm' }, { role: 'assistant', content: 'Sáu' },
    { role: 'user', content: 'Bảy' },
  ])
  assert.equal(messages.length, 6)
  assert.equal(messages.at(-1)?.content, 'Bảy')
  assert.throws(() => normalizeAssistantMessages([{ role: 'assistant', content: 'Không hợp lệ' }]), /VALIDATION_ERROR/)
})

test('assistant fails closed without matching public knowledge', async () => {
  const result = await answerAssistant([{ role: 'user', content: 'zqxwvut987654321' }])
  assert.equal(result.sources.length, 0)
  assert.match(result.answer, /chưa tìm thấy thông tin đủ phù hợp/i)
})
