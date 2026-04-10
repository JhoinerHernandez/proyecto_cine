import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// POST validate ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, error: 'Codigo de tiquete requerido' }, { status: 400 })
    }

    // Clean the code (remove JHOCEAN Films: prefix if present from QR scan)
    const cleanCode = code.replace('JHOCEAN Films:', '')

    // Find ticket by code
    const ticket = db.tickets.findByCode(cleanCode)
    
    if (!ticket) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tiquete no encontrado',
        status: 'invalid'
      }, { status: 404 })
    }

    // Check ticket status
    if (ticket.status === 'used') {
      return NextResponse.json({ 
        success: false, 
        error: 'Este tiquete ya fue utilizado',
        status: 'used',
        data: {
          ticket_code: ticket.ticket_code,
          validated_at: ticket.validated_at,
          movie: ticket.showtime?.movie?.title,
          date: ticket.showtime?.date,
          time: ticket.showtime?.start_time,
          seat: `${ticket.seat?.row_letter}${ticket.seat?.seat_number}`
        }
      }, { status: 400 })
    }

    if (ticket.status === 'cancelled') {
      return NextResponse.json({ 
        success: false, 
        error: 'Este tiquete fue cancelado',
        status: 'cancelled'
      }, { status: 400 })
    }

    // Check if showtime is valid (same day or upcoming)
    const today = new Date().toISOString().split('T')[0]
    if (ticket.showtime && ticket.showtime.date < today) {
      return NextResponse.json({ 
        success: false, 
        error: 'Este tiquete es para una funcion pasada',
        status: 'expired'
      }, { status: 400 })
    }

    // Validate the ticket
    const validatedTicket = db.tickets.validate(cleanCode)

    if (!validatedTicket) {
      return NextResponse.json({ success: false, error: 'Error al validar tiquete' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tiquete validado exitosamente',
      status: 'valid',
      data: {
        ticket_code: validatedTicket.ticket_code,
        customer_name: validatedTicket.customer_name,
        movie: ticket.showtime?.movie?.title,
        room: ticket.showtime?.room,
        date: ticket.showtime?.date,
        time: ticket.showtime?.start_time,
        seat: `${ticket.seat?.row_letter}${ticket.seat?.seat_number}`,
        validated_at: validatedTicket.validated_at
      }
    })
  } catch (error) {
    console.error('Error validating ticket:', error)
    return NextResponse.json({ success: false, error: 'Error al validar tiquete' }, { status: 500 })
  }
}

// GET check ticket status (without validating)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ success: false, error: 'Codigo de tiquete requerido' }, { status: 400 })
    }

    const cleanCode = code.replace('JHOCEAN Films:', '')
    const ticket = db.tickets.findByCode(cleanCode)
    
    if (!ticket) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tiquete no encontrado',
        status: 'invalid'
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ticket_code: ticket.ticket_code,
        status: ticket.status,
        customer_name: ticket.customer_name,
        movie: ticket.showtime?.movie?.title,
        room: ticket.showtime?.room,
        date: ticket.showtime?.date,
        time: ticket.showtime?.start_time,
        seat: `${ticket.seat?.row_letter}${ticket.seat?.seat_number}`,
        price: ticket.price,
        purchase_date: ticket.purchase_date,
        validated_at: ticket.validated_at
      }
    })
  } catch (error) {
    console.error('Error checking ticket:', error)
    return NextResponse.json({ success: false, error: 'Error al verificar tiquete' }, { status: 500 })
  }
}
