'use client'

import { useState } from 'react'

export default function ProductsTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testProductsAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      
      setResult(JSON.stringify(data, null, 2))
      console.log('Products API Response:', data)
    } catch (error) {
      setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products API Test</h1>
      
      <button 
        onClick={testProductsAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Products API'}
      </button>

      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">API Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}
