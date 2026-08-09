import assert from 'node:assert/strict'
import { test } from 'node:test'
import { extractMarkdownHeadings } from '../src/lib/markdown'

test('markdown headings receive stable unique anchors', () => {
  const headings = extractMarkdownHeadings('## Chọn loa\n\n### Cùng một câu\n\n## Chọn loa')
  assert.equal(headings.length, 3)
  assert.equal(headings[0].id, 'chọn-loa')
  assert.equal(headings[1].id, 'cùng-một-câu')
  assert.equal(headings[2].id, 'chọn-loa-1')
})
