'use client'

import { useEffect, useRef } from 'react'
import { Film, Calendar, Clock, MapPin, Armchair, QrCode } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import QRCode from 'qrcode'

interface TicketCardProps {
  ticketCode: string
  movieTitle: string
  date: string
  time: string
  room: string
  seat: string
  customerName: string
  price: number
}

export function TicketCard({
  ticketCode,
  movieTitle,
  date,
  time,
  room,
  seat,
  customerName,
  price
}: TicketCardProps) {
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, `JHOCEAN Films:${ticketCode}`, {
        width: 120,
        margin: 1,
        color: {
          dark: '#ffffff',
          light: '#00000000'
        }
      })
    }
  }, [ticketCode])

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-secondary/50">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-primary p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Film className="h-6 w-6 text-primary-foreground" />
            <span className="text-xl font-bold text-primary-foreground">JHOCEAN Films</span>
          </div>
        </div>

        {/* Ticket content */}
        <div className="p-6">
          {/* Movie title */}
          <h3 className="text-balance text-center text-xl font-bold text-card-foreground">
            {movieTitle}
          </h3>

          {/* Details */}
          <div className="mt-4 grid gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-card-foreground">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-card-foreground">{time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-card-foreground">{room}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Armchair className="h-4 w-4 text-primary" />
              <span className="text-card-foreground">Asiento {seat}</span>
            </div>
          </div>

          {/* Dashed line */}
          <div className="my-6 border-t-2 border-dashed border-border" />

          {/* QR Code and info */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium text-card-foreground">{customerName}</p>
              
              <p className="mt-2 text-xs text-muted-foreground">Codigo</p>
              <p className="font-mono text-sm font-bold text-primary">{ticketCode}</p>
              
              <p className="mt-2 text-xs text-muted-foreground">Precio</p>
              <p className="text-lg font-bold text-card-foreground">${price.toLocaleString()}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <canvas ref={qrRef} className="rounded-lg" />
              <p className="mt-1 text-xs text-muted-foreground">Escanear al ingresar</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-secondary/50 px-6 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            Presenta este tiquete en la entrada de la sala
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
