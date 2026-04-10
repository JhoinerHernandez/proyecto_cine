import { NextRequest, NextResponse } from 'next/server'
import { db, generateTicketCode } from '@/lib/db'
import type { TicketPurchaseData } from '@/lib/types'

// GET all tickets (admin only)
export async function GET() {
  try {
    const tickets = db.tickets.findAll()
    return NextResponse.json({ success: true, data: tickets })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener tiquetes' }, { status: 500 })
  }
}

// POST purchase tickets
export async function POST(request: NextRequest) {
  try {
    const body: TicketPurchaseData = await request.json()

    // Validate required fields
    if (!body.showtime_id || !body.seats || body.seats.length === 0 || !body.customer_name || !body.customer_email) {
      return NextResponse.json({ success: false, error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Get showtime
    const showtime = db.showtimes.findById(body.showtime_id)
    if (!showtime) {
      return NextResponse.json({ success: false, error: 'Funcion no encontrada' }, { status: 404 })
    }

    // Check if all seats are available
    const requestedSeats = db.seats.findByIds(body.seats)
    const unavailableSeats = requestedSeats.filter(s => s.status !== 'available')
    
    if (unavailableSeats.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Algunos asientos ya no estan disponibles' 
      }, { status: 400 })
    }

    // Create tickets for each seat
    const createdTickets = []
    for (const seatId of body.seats) {
      const seat = requestedSeats.find(s => s.id === seatId)
      if (!seat) continue

      const ticketCode = generateTicketCode()
      // Generate QR code data (URL for validation)
      const qrData = `JHOCEAN Films:${ticketCode}`

      const ticket = db.tickets.create({
        showtime_id: body.showtime_id,
        seat_id: seatId,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone || '',
        ticket_code: ticketCode,
        qr_code: qrData,
        price: showtime.price,
        status: 'active'
      })

      createdTickets.push(ticket)
    }

    // Mark seats as sold
    db.seats.updateStatus(body.seats, 'sold')

    return NextResponse.json({ 
      success: true, 
      data: createdTickets, 
      message: `${createdTickets.length} tiquete(s) comprado(s) exitosamente` 
    })
  } catch (error) {
    console.error('Error purchasing tickets:', error)
    return NextResponse.json({ success: false, error: 'Error al comprar tiquetes' }, { status: 500 })
  }
}
