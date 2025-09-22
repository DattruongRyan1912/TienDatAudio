import { NextRequest, NextResponse } from 'next/server'
import { getComboBySlug, getComboProducts } from '@/lib/data'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        
        const combo = await getComboBySlug(slug)
        if (!combo) {
            return NextResponse.json({ error: 'Combo not found' }, { status: 404 })
        }

        // Get full product details for the combo
        const products = await getComboProducts(combo)

        return NextResponse.json({ 
            combo: {
                ...combo,
                products
            }
        })

    } catch (error) {
        console.error('Error fetching combo:', error)
        return NextResponse.json(
            { error: 'Failed to fetch combo' },
            { status: 500 }
        )
    }
}
