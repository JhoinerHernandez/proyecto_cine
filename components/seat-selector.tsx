'use client'

import { cn } from '@/lib/utils'
import type { Seat } from '@/lib/types'

interface SeatSelectorProps {
  seats: Seat[]
  selectedSeats: number[]
  onSeatSelect: (seatId: number) => void
  maxSeats?: number
}

export function SeatSelector({ seats, selectedSeats, onSeatSelect, maxSeats = 10 }: SeatSelectorProps) {
  // Group seats by row
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  
  const seatsByRow = rows.reduce((acc, row) => {
    acc[row] = seats.filter(s => s.row_letter === row).sort((a, b) => a.seat_number - b.seat_number)
    return acc
  }, {} as Record<string, Seat[]>)

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'available') return
    
    if (selectedSeats.includes(seat.id)) {
      onSeatSelect(seat.id)
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seat.id)
    }
  }

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) {
      return 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
    }
    switch (seat.status) {
      case 'available':
        return 'bg-secondary text-secondary-foreground hover:bg-accent cursor-pointer'
      case 'reserved':
        return 'bg-warning/50 text-warning-foreground cursor-not-allowed'
      case 'sold':
        return 'bg-muted text-muted-foreground cursor-not-allowed'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="w-full">
      {/* Screen indicator */}
      <div className="mb-8">
        <div className="mx-auto h-2 w-3/4 rounded-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        <p className="mt-2 text-center text-sm text-muted-foreground">PANTALLA</p>
      </div>

      {/* Seats grid */}
      <div className="mx-auto max-w-4xl overflow-x-auto pb-4">
        <div className="flex flex-col items-center gap-2 min-w-[600px]">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              {/* Row label */}
              <span className="w-6 text-center text-sm font-medium text-muted-foreground">{row}</span>
              
              {/* Seats */}
              <div className="flex gap-1">
                {seatsByRow[row]?.map((seat, index) => (
                  <div key={seat.id} className="flex items-center">
                    {/* Add aisle after seat 7 */}
                    {index === 7 && <div className="w-4" />}
                    <button
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status !== 'available' && !selectedSeats.includes(seat.id)}
                      className={cn(
                        'h-7 w-7 rounded-t-lg text-xs font-medium transition-all',
                        getSeatColor(seat)
                      )}
                      title={`${seat.row_letter}${seat.seat_number} - ${
                        selectedSeats.includes(seat.id) 
                          ? 'Seleccionado' 
                          : seat.status === 'available' 
                            ? 'Disponible' 
                            : seat.status === 'reserved' 
                              ? 'Reservado' 
                              : 'Vendido'
                      }`}
                    >
                      {seat.seat_number}
                    </button>
                  </div>
                ))}
              </div>

              {/* Row label (right side) */}
              <span className="w-6 text-center text-sm font-medium text-muted-foreground">{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-lg bg-secondary" />
          <span className="text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-lg bg-primary" />
          <span className="text-muted-foreground">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-lg bg-muted" />
          <span className="text-muted-foreground">Vendido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-lg bg-warning/50" />
          <span className="text-muted-foreground">Reservado</span>
        </div>
      </div>
    </div>
  )
}
