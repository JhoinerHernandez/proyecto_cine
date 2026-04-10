'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Film, Clock, MapPin, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Movie, Showtime } from '@/lib/types'

// Genera 7 días desde hoy + offset de semanas
const getWeekDays = (weekOffset: number = 0) => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const days = []
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i + weekOffset * 7)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      label: dayNames[date.getDay()],
      date: dateStr,
      dayNumber: date.getDate(),
      monthShort: date.toLocaleDateString('es-CO', { month: 'short' }),
      isToday: dateStr === todayStr,
      full: date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    })
  }
  return days
}

export default function CarteleraPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)

  const weekDays = getWeekDays(weekOffset)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, showtimesRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/showtimes')
        ])
        const moviesData = await moviesRes.json()
        const showtimesData = await showtimesRes.json()
        if (moviesData.success) setMovies(moviesData.data)
        if (showtimesData.success) setShowtimes(showtimesData.data)

        const params = new URLSearchParams(window.location.search)
        const movieId = params.get('movie')
        if (movieId) setSelectedMovie(parseInt(movieId))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredShowtimes = showtimes.filter(s => {
    if (s.date !== selectedDate) return false
    if (selectedMovie && s.movie_id !== selectedMovie) return false
    return s.status === 'scheduled'
  })

  const showtimesByMovie = filteredShowtimes.reduce((acc, showtime) => {
    const movieId = showtime.movie_id
    if (!acc[movieId]) {
      acc[movieId] = {
        movie: movies.find(m => m.id === movieId),
        showtimes: []
      }
    }
    acc[movieId].showtimes.push(showtime)
    return acc
  }, {} as Record<number, { movie: Movie | undefined; showtimes: Showtime[] }>)

  const weekRangeLabel = () => {
    const first = weekDays[0]
    const last = weekDays[6]
    return `${first.dayNumber} ${first.monthShort} — ${last.dayNumber} ${last.monthShort}`
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
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Cartelera</h1>
          <p className="text-muted-foreground">Selecciona una fecha y pelicula para ver las funciones disponibles</p>
        </div>

        {/* Week Day Tabs con navegación */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(prev => prev - 1)}
              disabled={weekOffset === 0}
              className="shrink-0 px-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1">
              <p className="mb-2 text-center text-xs text-muted-foreground font-medium">
                {weekRangeLabel()}
              </p>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const hasShowtimes = showtimes.some(s => s.date === day.date && s.status === 'scheduled')
                  const isSelected = selectedDate === day.date
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`flex flex-col items-center rounded-lg px-2 py-3 text-sm font-medium transition-all
                        ${isSelected
                          ? 'bg-primary text-primary-foreground shadow'
                          : day.isToday
                            ? 'border border-primary text-primary hover:bg-primary/10'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                      <span className="text-xs">{day.label}</span>
                      <span className="text-lg font-bold">{day.dayNumber}</span>
                      {hasShowtimes && (
                        <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="shrink-0 px-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Movie Filter */}
        {selectedMovie && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMovie(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver todas las peliculas
            </Button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        ) : Object.keys(showtimesByMovie).length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">No hay funciones disponibles</h2>
            <p className="mt-2 text-muted-foreground">
              No hay funciones programadas para {weekDays.find(d => d.date === selectedDate)?.full}
              {selectedMovie && ' para esta pelicula'}
            </p>
            {selectedMovie && (
              <Button variant="outline" className="mt-4" onClick={() => setSelectedMovie(null)}>
                Ver todas las peliculas
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(showtimesByMovie).map(([movieId, { movie, showtimes: movieShowtimes }]) => (
              <Card key={movieId} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-64 w-full md:h-auto md:w-48 flex-shrink-0">
                    {movie?.poster_url ? (
                      <Image
                        src={movie.poster_url}
                        alt={movie?.title || 'Pelicula'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 192px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <Film className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <CardContent className="flex-1 p-6">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-card-foreground">{movie?.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2 py-1">{movie?.genre}</span>
                        <span>{movie?.duration} min</span>
                        <span className="rounded-full bg-secondary px-2 py-1">{movie?.rating}</span>
                      </div>
                      {movie?.synopsis && (
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                          {movie.synopsis}
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                        Funciones disponibles
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {movieShowtimes
                          .sort((a, b) => a.start_time.localeCompare(b.start_time))
                          .map((showtime) => (
                            <Link key={showtime.id} href={`/comprar/${showtime.id}`}>
                              <Card className="cursor-pointer transition-all hover:ring-2 hover:ring-primary">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="text-center">
                                      <div className="flex items-center gap-1 text-lg font-bold text-card-foreground">
                                        <Clock className="h-4 w-4" />
                                        {showtime.start_time}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {showtime.room}
                                      </div>
                                    </div>
                                    <div className="border-l border-border pl-3">
                                      <span className="text-lg font-bold text-primary">
                                        ${showtime.price.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}