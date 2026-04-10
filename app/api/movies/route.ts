import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { MovieFormData } from '@/lib/types'

// GET all movies
export async function GET() {
  try {
    const movies = db.movies.findAll()
    return NextResponse.json({ success: true, data: movies })
  } catch (error) {
    console.error('Error fetching movies:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener peliculas' }, { status: 500 })
  }
}

// POST create movie
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body: MovieFormData = await request.json()

    // Validate required fields
    if (!body.title || !body.genre || !body.duration) {
      return NextResponse.json({ success: false, error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const movie = db.movies.create({
      title: body.title,
      genre: body.genre,
      duration: body.duration,
      synopsis: body.synopsis || '',
      poster_url: body.poster_url || '',
      rating: body.rating || 'PG',
      release_date: body.release_date || new Date().toISOString().split('T')[0],
      director: body.director || '',
      status: body.status || 'active'
    })

    return NextResponse.json({ success: true, data: movie, message: 'Pelicula creada exitosamente' })
  } catch (error) {
    console.error('Error creating movie:', error)
    return NextResponse.json({ success: false, error: 'Error al crear pelicula' }, { status: 500 })
  }
}
