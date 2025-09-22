'use client'

import { useState, useEffect } from 'react'
import { getFeaturedCombos, type Combo } from '@/lib/data'
import ReelViewer from '@/components/ReelViewer'
import Loading from '@/components/Loading'

export default function CombosPage() {
    const [combos, setCombos] = useState<Combo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadCombos = async () => {
            try {
                setIsLoading(true)
                const featuredCombos = await getFeaturedCombos()
                setCombos(featuredCombos)
            } catch (err) {
                console.error('Error loading combos:', err)
                setError('Không thể tải được combo sản phẩm')
            } finally {
                setIsLoading(false)
            }
        }

        loadCombos()
    }, [])

    const handleComboChange = (index: number) => {
        console.log('Current combo:', combos[index]?.title)
        // Track analytics, update URL, etc.
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
                    <p className="text-white/80 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    if (combos.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Chưa có combo nào</h2>
                    <p className="text-white/80">Chúng tôi đang cập nhật combo sản phẩm mới</p>
                </div>
            </div>
        )
    }

    return (
        <main>
            <ReelViewer 
                combos={combos} 
                onComboChange={handleComboChange}
            />
        </main>
    )
}
