import { NextRequest, NextResponse } from 'next/server'
import { getAllCombos, getFeaturedCombos, getComboBySlug } from '@/lib/data'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const featured = searchParams.get('featured')
        const limit = searchParams.get('limit')
        const slug = searchParams.get('slug')

        if (slug) {
            // Get specific combo by slug
            const combo = await getComboBySlug(slug)
            if (!combo) {
                return NextResponse.json({ error: 'Combo not found' }, { status: 404 })
            }
            return NextResponse.json({ combo })
        }

        if (featured === 'true') {
            // Get featured combos
            const limitNum = limit ? parseInt(limit) : undefined
            const combos = await getFeaturedCombos(limitNum)
            return NextResponse.json({ combos })
        }

        // Get all combos
        const combos = await getAllCombos()
        return NextResponse.json({ combos })

    } catch (error) {
        console.error('Error fetching combos:', error)
        return NextResponse.json(
            { error: 'Failed to fetch combos' },
            { status: 500 }
        )
    }
}
