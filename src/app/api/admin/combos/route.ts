import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getAllCombos, type Combo } from '@/lib/data'

const COMBOS_FILE = path.join(process.cwd(), 'data', 'combos.json')

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(process.cwd(), 'data')
    try {
        await fs.access(dataDir)
    } catch {
        await fs.mkdir(dataDir, { recursive: true })
    }
}

// Read combos from file
async function readCombosFile(): Promise<Combo[]> {
    try {
        await ensureDataDirectory()
        const data = await fs.readFile(COMBOS_FILE, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        // If file doesn't exist, return empty array
        console.log('Combos file not found, creating new one')
        return []
    }
}

// Write combos to file
async function writeCombosFile(combos: Combo[]): Promise<void> {
    await ensureDataDirectory()
    await fs.writeFile(COMBOS_FILE, JSON.stringify(combos, null, 2), 'utf-8')
}

export async function GET() {
    try {
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

export async function POST(request: NextRequest) {
    try {
        const comboData = await request.json()
        
        // Validate required fields
        if (!comboData.title || !comboData.description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            )
        }

        const combos = await readCombosFile()
        
        // Create new combo
        const newCombo: Combo = {
            ...comboData,
            id: `combo-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0
        }

        combos.unshift(newCombo)
        await writeCombosFile(combos)

        return NextResponse.json({ 
            success: true, 
            combo: newCombo,
            message: 'Combo created successfully' 
        })

    } catch (error) {
        console.error('Error creating combo:', error)
        return NextResponse.json(
            { error: 'Failed to create combo' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const comboData = await request.json()
        
        if (!comboData.id) {
            return NextResponse.json(
                { error: 'Combo ID is required for update' },
                { status: 400 }
            )
        }

        const combos = await readCombosFile()
        const comboIndex = combos.findIndex(c => c.id === comboData.id)
        
        if (comboIndex === -1) {
            return NextResponse.json(
                { error: 'Combo not found' },
                { status: 404 }
            )
        }

        // Update combo
        const updatedCombo = {
            ...combos[comboIndex],
            ...comboData,
            updatedAt: new Date().toISOString()
        }

        combos[comboIndex] = updatedCombo
        await writeCombosFile(combos)

        return NextResponse.json({ 
            success: true, 
            combo: updatedCombo,
            message: 'Combo updated successfully' 
        })

    } catch (error) {
        console.error('Error updating combo:', error)
        return NextResponse.json(
            { error: 'Failed to update combo' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        
        if (!id) {
            return NextResponse.json(
                { error: 'Combo ID is required' },
                { status: 400 }
            )
        }

        const combos = await readCombosFile()
        const comboIndex = combos.findIndex(c => c.id === id)
        
        if (comboIndex === -1) {
            return NextResponse.json(
                { error: 'Combo not found' },
                { status: 404 }
            )
        }

        const deletedCombo = combos[comboIndex]
        combos.splice(comboIndex, 1)
        await writeCombosFile(combos)

        return NextResponse.json({ 
            success: true, 
            message: 'Combo deleted successfully',
            combo: deletedCombo
        })

    } catch (error) {
        console.error('Error deleting combo:', error)
        return NextResponse.json(
            { error: 'Failed to delete combo' },
            { status: 500 }
        )
    }
}
