import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET single showtime with seats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const showtime = db.showtimes.findById(parseInt(id))
    
    if (!showtime) {
      return NextResponse.json({ success: false, error: 'Funcion no encontrada' }, { status: 404 })
    }

    const seats = db.seats.findByShowtime(showtime.id)
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        ...showtime, 
        seats,
        availableSeats: seats.filter(s => s.status === 'available').length
      } 
    })
  } catch (error) {
    console.error('Error fetching showtime:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener funcion' }, { status: 500 })
  }
}

// PUT update showtime
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
    const body = await request.json()
    const showtimeId = parseInt(id)

    // If changing time, check for overlaps
    if (body.start_time || body.room || body.date) {
      const currentShowtime = db.showtimes.findById(showtimeId)
      if (!currentShowtime) {
        return NextResponse.json({ success: false, error: 'Funcion no encontrada' }, { status: 404 })
      }

      const newRoom = body.room || currentShowtime.room
      const newDate = body.date || currentShowtime.date
      const newStartTime = body.start_time || currentShowtime.start_time
      const newEndTime = body.end_time || currentShowtime.end_time

      const hasOverlap = db.showtimes.checkOverlap(newRoom, newDate, newStartTime, newEndTime, showtimeId)
      if (hasOverlap) {
        return NextResponse.json({ 
          success: false, 
          error: 'Ya existe una funcion programada en esta sala durante ese horario' 
        }, { status: 400 })
      }
    }

    const showtime = db.showtimes.update(showtimeId, body)
    
    if (!showtime) {
      return NextResponse.json({ success: false, error: 'Funcion no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: showtime, message: 'Funcion actualizada exitosamente' })
  } catch (error) {
    console.error('Error updating showtime:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar funcion' }, { status: 500 })
  }
}

// DELETE cancel showtime
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
    const cancelled = db.showtimes.cancel(parseInt(id))
    
    if (!cancelled) {
      return NextResponse.json({ success: false, error: 'Funcion no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Funcion cancelada exitosamente' })
  } catch (error) {
    console.error('Error cancelling showtime:', error)
    return NextResponse.json({ success: false, error: 'Error al cancelar funcion' }, { status: 500 })
  }
}
