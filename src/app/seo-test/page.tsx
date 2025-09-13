'use client'

import React from 'react'

export default function SEOTestPage() {
  const testSEOAPI = async () => {
    try {
      // Test GET API first
      console.log('Testing GET API...')
      const getResponse = await fetch('/api/admin/seo/products?productId=sp001')
      const getResult = await getResponse.json()
      console.log('GET Result:', getResult)

      // Test PUT API
      console.log('Testing PUT API...')
      const testSEOData = {
        metaTitle: 'Test SEO Title - JBL PartyBox 110',
        metaDescription: 'Test SEO description for JBL PartyBox 110 speaker with amazing sound quality',
        keywords: ['jbl', 'partybox', 'speaker', 'bluetooth'],
        ogTitle: 'Test OG Title - JBL PartyBox 110',
        ogDescription: 'Test OG description for social media',
        ogImage: '/images/products/jbl-partybox-110-1.svg'
      }

      const putResponse = await fetch('/api/admin/seo/products?productId=sp001', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testSEOData),
      })

      const putResult = await putResponse.json()
      console.log('PUT Result:', putResult)

      // Test GET again to see if data was saved
      console.log('Testing GET API again after save...')
      const getResponse2 = await fetch('/api/admin/seo/products?productId=sp001')
      const getResult2 = await getResponse2.json()
      console.log('GET Result after save:', getResult2)

    } catch (error) {
      console.error('Test failed:', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">SEO API Test Page</h1>
      <button 
        onClick={testSEOAPI}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test SEO API
      </button>
      <div className="mt-4">
        <p>Open console to see test results</p>
      </div>
    </div>
  )
}
