'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Film, Calendar, Clock, MapPin, Ticket, LogIn, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Movie, Showtime } from '@/lib/types'

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{ username: string; role: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, showtimesRes, sessionRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/showtimes'),
          fetch('/api/auth/session')
        ])

        const moviesData = await moviesRes.json()
        const showtimesData = await showtimesRes.json()
        const sessionData = await sessionRes.json()

        if (moviesData.success) setMovies(moviesData.data)
        if (showtimesData.success) setShowtimes(showtimesData.data)
        if (sessionData.authenticated) setSession(sessionData.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setSession(null)
  }

  const today = new Date().toISOString().split('T')[0]
  const todayShowtimes = showtimes.filter(s => s.date === today)

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
          <nav className="flex items-center gap-4">
            <Link href="/cartelera" className="text-muted-foreground hover:text-foreground transition-colors">
              Cartelera
            </Link>
            <Link href="/validar" className="text-muted-foreground hover:text-foreground transition-colors">
              Validar Tiquete
            </Link>

            {session?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Administración
                </Button>
              </Link>
            )}

            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{session.username}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </div>
            ) : (
              <Link href="/admin/login">
                <Button size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Tu experiencia cinematografica
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Descubre las mejores peliculas en nuestras salas de ultima generacion. 
            Reserva tus asientos y disfruta del mejor entretenimiento.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/cartelera">
              <Button size="lg" className="gap-2">
                <Ticket className="h-5 w-5" />
                Ver Cartelera
              </Button>
            </Link>
            <Link href="/validar">
              <Button size="lg" variant="outline" className="gap-2">
                Validar Tiquete
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Now Showing */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">En Cartelera</h2>
            <p className="text-muted-foreground">Peliculas disponibles ahora</p>
          </div>
          <Link href="/cartelera">
            <Button variant="ghost">Ver todas</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-lg bg-muted" />
                <div className="mt-3 h-4 rounded bg-muted" />
                <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {movies.slice(0, 6).map((movie) => (
              <Link key={movie.id} href={`/cartelera?movie=${movie.id}`}>
                <Card className="group cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-sm font-medium">Ver funciones</span>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="line-clamp-1 font-semibold text-card-foreground">{movie.title}</h3>
                    <p className="text-sm text-muted-foreground">{movie.genre}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Today's Showtimes */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Funciones de Hoy</h2>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-muted p-4">
                  <div className="h-6 w-3/4 rounded bg-background" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-background" />
                </div>
              ))}
            </div>
          ) : todayShowtimes.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No hay funciones programadas para hoy</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayShowtimes.map((showtime) => (
                <Link key={showtime.id} href={`/comprar/${showtime.id}`}>
                  <Card className="cursor-pointer transition-all hover:ring-2 hover:ring-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-card-foreground">
                            {showtime.movie?.title || 'Pelicula'}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {showtime.start_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {showtime.room}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                          ${showtime.price.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} JHOCEAN Films. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}