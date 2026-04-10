import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { MovieFormData } from '@/lib/types'

// GET single movie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const movie = db.movies.findById(parseInt(id))
    
    if (!movie) {
      return NextResponse.json({ success: false, error: 'Pelicula no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: movie })
  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener pelicula' }, { status: 500 })
  }
}

// PUT update movie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body: Partial<MovieFormData> = await request.json()

    const movie = db.movies.update(parseInt(id), body)
    
    if (!movie) {
      return NextResponse.json({ success: false, error: 'Pelicula no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: movie, message: 'Pelicula actualizada exitosamente' })
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar pelicula' }, { status: 500 })
  }
}

// DELETE movie (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const deleted = db.movies.delete(parseInt(id))
    
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Pelicula no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Pelicula eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json({ success: false, error: 'Error al eliminar pelicula' }, { status: 500 })
  }
}
