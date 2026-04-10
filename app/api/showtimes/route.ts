import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { ShowtimeFormData } from '@/lib/types'

// GET all showtimes (optionally filtered by date)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    let showtimes
    if (date) {
      showtimes = db.showtimes.findByDate(date)
    } else {
      showtimes = db.showtimes.findAll().map(s => ({
        ...s,
        movie: db.movies.findById(s.movie_id)
      }))
    }

    return NextResponse.json({ success: true, data: showtimes })
  } catch (error) {
    console.error('Error fetching showtimes:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener funciones' }, { status: 500 })
  }
}

// POST create showtime
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body: ShowtimeFormData = await request.json()

    // Validate required fields
    if (!body.movie_id || !body.room || !body.date || !body.start_time || !body.price) {
      return NextResponse.json({ success: false, error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Get movie duration to calculate end time
    const movie = db.movies.findById(body.movie_id)
    if (!movie) {
      return NextResponse.json({ success: false, error: 'Pelicula no encontrada' }, { status: 404 })
    }

    // Calculate end time
    const [hours, minutes] = body.start_time.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + movie.duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

    // Check for overlapping showtimes in the same room
    const hasOverlap = db.showtimes.checkOverlap(body.room, body.date, body.start_time, endTime)
    if (hasOverlap) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ya existe una funcion programada en esta sala durante ese horario' 
      }, { status: 400 })
    }

    const showtime = db.showtimes.create({
      movie_id: body.movie_id,
      room: body.room,
      date: body.date,
      start_time: body.start_time,
      end_time: endTime,
      price: body.price
    })

    return NextResponse.json({ success: true, data: showtime, message: 'Funcion creada exitosamente' })
  } catch (error) {
    console.error('Error creating showtime:', error)
    return NextResponse.json({ success: false, error: 'Error al crear funcion' }, { status: 500 })
  }
}
