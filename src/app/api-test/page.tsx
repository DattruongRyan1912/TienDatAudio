'use client'

import { useEffect, useState } from 'react'

export default function APITestPage() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [...prev, message])
    console.log(message)
  }

  const testAPI = async () => {
    addResult('🔍 Testing Theme API...')
    
    // Test GET
    try {
      const getResponse = await fetch('/api/admin/theme')
      const getData = await getResponse.json()
      addResult(`✅ GET: ${JSON.stringify(getData, null, 2)}`)
    } catch (error) {
      addResult(`❌ GET Error: ${error}`)
    }
    
    // Test PUT with red color
    try {
      const testTheme = {
        id: "test-red",
        colors: {
          primary: "#ff0000", // Red for easy testing
          secondary: "#f97316",
          accent: "#06b6d4",
          background: "#ffffff",
          surface: "#f8fafc",
          text: "#111827",
          textLight: "#6b7280",
          border: "#e5e7eb",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444"
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem"
          },
          fontWeight: {
            normal: "400",
            medium: "500",
            semibold: "600",
            bold: "700"
          }
        },
        layout: {
          maxWidth: "1200px",
          headerHeight: "80px",
          footerHeight: "200px",
          sidebarWidth: "280px",
          spacing: {
            xs: "0.5rem",
            sm: "1rem",
            md: "1.5rem",
            lg: "2rem",
            xl: "3rem"
          },
          borderRadius: {
            sm: "0.25rem",
            md: "0.5rem",
            lg: "1rem",
            xl: "1.5rem"
          }
        }
      }
      
      const putResponse = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: testTheme }),
      })
      
      const putData = await putResponse.json()
      addResult(`✅ PUT: ${JSON.stringify(putData, null, 2)}`)
      
      // Verify the change
      const getResponse2 = await fetch('/api/admin/theme')
      const getData2 = await getResponse2.json()
      addResult(`🔍 Verify: Primary color is now ${getData2.data?.colors?.primary}`)
      
    } catch (error) {
      addResult(`❌ PUT Error: ${error}`)
    }
  }

  useEffect(() => {
    testAPI()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Theme API Test</h1>
      <div className="space-y-2">
        {results.map((result, index) => (
          <pre key={index} className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {result}
          </pre>
        ))}
      </div>
    </div>
  )
}
