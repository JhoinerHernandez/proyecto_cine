'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Film, Calendar, Clock, MapPin, ArrowLeft, 
  AlertCircle, CheckCircle, Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SeatSelector } from '@/components/seat-selector'
import { TicketCard } from '@/components/ticket-card'
import type { Showtime, Seat, Ticket } from '@/lib/types'

interface ShowtimeWithSeats extends Showtime {
  seats: Seat[]
  availableSeats: number
}

export default function PurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [showtime, setShowtime] = useState<ShowtimeWithSeats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [step, setStep] = useState<'seats' | 'info' | 'success'>('seats')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar sesión primero
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()

        if (!sessionData.authenticated) {
          router.push('/admin/login')
          return
        }

        setIsAuthenticated(true)

        // Si tiene sesión, cargar la función
        const res = await fetch(`/api/showtimes/${id}`)
        const data = await res.json()
        if (data.success) setShowtime(data.data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleSeatSelect = (seatId: number) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    )
  }

  const getSelectedSeatDetails = () => {
    if (!showtime) return []
    return selectedSeats.map(seatId => {
      const seat = showtime.seats.find(s => s.id === seatId)
      return seat ? `${seat.row_letter}${seat.seat_number}` : ''
    }).filter(Boolean)
  }

  const totalPrice = selectedSeats.length * (showtime?.price || 0)

  const handlePurchase = async () => {
    setError('')
    
    if (!customerName.trim()) {
      setError('Por favor ingresa tu nombre')
      return
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Por favor ingresa un email valido')
      return
    }

    setPurchasing(true)

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showtime_id: parseInt(id),
          seats: selectedSeats,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        })
      })

      const data = await res.json()

      if (data.success) {
        setPurchasedTickets(data.data)
        setStep('success')
      } else {
        setError(data.error || 'Error al procesar la compra')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setPurchasing(false)
    }
  }

  const formattedDate = showtime?.date 
    ? new Date(showtime.date + 'T12:00:00').toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : ''

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando funcion...</p>
        </div>
      </div>
    )
  }

  if (!showtime) {
    if (!isAuthenticated) return null

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Funcion no encontrada</h2>
          <p className="mt-2 text-muted-foreground">La funcion que buscas no existe o ya no esta disponible.</p>
          <Link href="/cartelera">
            <Button className="mt-4">Ver cartelera</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Film className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">JHOCEAN Films</span>
          </Link>
          <Link href="/cartelera">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Cartelera
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {step === 'success' ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-success" />
              <h1 className="mt-4 text-3xl font-bold text-foreground">Compra Exitosa</h1>
              <p className="mt-2 text-muted-foreground">
                Tus tiquetes han sido generados. Recibiras una copia en tu email.
              </p>
            </div>

            <div className="grid gap-6">
              {purchasedTickets.map((ticket) => {
                const seat = showtime.seats.find(s => s.id === ticket.seat_id)
                return (
                  <TicketCard
                    key={ticket.id}
                    ticketCode={ticket.ticket_code}
                    movieTitle={showtime.movie?.title || 'Pelicula'}
                    date={showtime.date}
                    time={showtime.start_time}
                    room={showtime.room}
                    seat={seat ? `${seat.row_letter}${seat.seat_number}` : ''}
                    customerName={ticket.customer_name}
                    price={ticket.price}
                  />
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Tiquetes
              </Button>
              <Link href="/cartelera">
                <Button variant="outline">Volver a Cartelera</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row">
                  {showtime.movie?.poster_url && (
                    <div className="relative h-40 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={showtime.movie.poster_url}
                        alt={showtime.movie.title}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-card-foreground">
                      {showtime.movie?.title}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2 py-1">{showtime.movie?.genre}</span>
                      <span>{showtime.movie?.duration} min</span>
                      <span className="rounded-full bg-secondary px-2 py-1">{showtime.movie?.rating}</span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-card-foreground">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-card-foreground">{showtime.start_time} - {showtime.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-card-foreground">{showtime.room}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {step === 'seats' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Selecciona tus Asientos</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {showtime.availableSeats} asientos disponibles - Maximo 10 por compra
                    </p>
                  </CardHeader>
                  <CardContent>
                    <SeatSelector
                      seats={showtime.seats}
                      selectedSeats={selectedSeats}
                      onSeatSelect={handleSeatSelect}
                      maxSeats={10}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Datos del Comprador</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ingresa tus datos para generar los tiquetes
                    </p>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo *</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Juan Perez"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo Electronico *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="juan@ejemplo.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefono (opcional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumen de Compra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Asientos seleccionados</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {selectedSeats.length > 0 ? getSelectedSeatDetails().join(', ') : 'Ninguno'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cantidad</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        {selectedSeats.length} tiquete(s)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Precio por tiquete</p>
                      <p className="text-lg font-semibold text-card-foreground">
                        ${showtime.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-primary">
                        ${totalPrice.toLocaleString()}
                      </p>
                    </div>
                    {step === 'seats' ? (
                      <Button
                        className="w-full"
                        size="lg"
                        disabled={selectedSeats.length === 0}
                        onClick={() => setStep('info')}
                      >
                        Continuar
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handlePurchase}
                          disabled={purchasing}
                        >
                          {purchasing ? 'Procesando...' : 'Confirmar Compra'}
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => setStep('seats')}
                          disabled={purchasing}
                        >
                          Volver a Asientos
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}