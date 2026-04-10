'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Clock, MapPin, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Movie, Showtime, ShowtimeFormData } from '@/lib/types'

const rooms = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4']

const emptyForm: ShowtimeFormData = {
  movie_id: 0,
  room: '',
  date: new Date().toISOString().split('T')[0],
  start_time: '14:00',
  price: 12000
}

// Genera 7 días desde un offset de semanas
const getWeekDays = (weekOffset: number = 0) => {
  const today = new Date()
  const days = []
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const todayStr = today.toISOString().split('T')[0]

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

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0])
  const [weekOffset, setWeekOffset] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [formData, setFormData] = useState<ShowtimeFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const weekDays = getWeekDays(weekOffset)

  const fetchData = async () => {
    try {
      const [showtimesRes, moviesRes] = await Promise.all([
        fetch('/api/showtimes'),
        fetch('/api/movies')
      ])
      const showtimesData = await showtimesRes.json()
      const moviesData = await moviesRes.json()
      if (showtimesData.success) setShowtimes(showtimesData.data)
      if (moviesData.success) setMovies(moviesData.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredShowtimes = showtimes.filter(s => s.date === selectedDay)

  const openCreateDialog = () => {
    setSelectedShowtime(null)
    setFormData({
      ...emptyForm,
      date: selectedDay,
      movie_id: movies[0]?.id || 0
    })
    setError('')
    setDialogOpen(true)
  }

  const openEditDialog = (showtime: Showtime) => {
    setSelectedShowtime(showtime)
    setFormData({
      movie_id: showtime.movie_id,
      room: showtime.room,
      date: showtime.date,
      start_time: showtime.start_time,
      price: showtime.price
    })
    setError('')
    setDialogOpen(true)
  }

  const openDeleteDialog = (showtime: Showtime) => {
    setSelectedShowtime(showtime)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = selectedShowtime
        ? `/api/showtimes/${selectedShowtime.id}`
        : '/api/showtimes'
      const method = selectedShowtime ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setSelectedDay(formData.date)
        setDialogOpen(false)
        fetchData()
      } else {
        setError(data.error || 'Error al guardar')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedShowtime) return
    setSaving(true)

    try {
      const res = await fetch(`/api/showtimes/${selectedShowtime.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        setDeleteDialogOpen(false)
        fetchData()
      } else {
        setError(data.error || 'Error al cancelar')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: Showtime['status']) => {
    const styles = {
      scheduled: 'bg-primary/20 text-primary',
      ongoing: 'bg-warning/20 text-warning',
      finished: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/20 text-destructive'
    }
    const labels = {
      scheduled: 'Programada',
      ongoing: 'En curso',
      finished: 'Finalizada',
      cancelled: 'Cancelada'
    }
    return (
      <span className={`rounded-full px-2 py-1 text-xs ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // Título del rango de semana visible
  const weekRangeLabel = () => {
    const first = weekDays[0]
    const last = weekDays[6]
    return `${first.dayNumber} ${first.monthShort} — ${last.dayNumber} ${last.monthShort}`
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funciones</h1>
          <p className="text-muted-foreground">Programa las funciones de cine</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Funcion
        </Button>
      </div>

      {/* Week Day Tabs con navegación */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2">
            {/* Botón semana anterior - solo si no estamos en la semana actual */}
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
                  const hasShowtimes = showtimes.some(s => s.date === day.date)
                  const isSelected = selectedDay === day.date
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(day.date)}
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

            {/* Botón semana siguiente */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="shrink-0 px-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Showtimes Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Funciones del {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} ({filteredShowtimes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredShowtimes.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="mt-4 text-muted-foreground">No hay funciones programadas para este día</p>
              <Button onClick={openCreateDialog} variant="outline" className="mt-4">
                Programar funcion
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pelicula</TableHead>
                    <TableHead>Sala</TableHead>
                    <TableHead>Hora Inicio</TableHead>
                    <TableHead>Hora Fin</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShowtimes.map((showtime) => (
                    <TableRow key={showtime.id}>
                      <TableCell className="font-medium">
                        {showtime.movie?.title || 'Pelicula desconocida'}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {showtime.room}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {showtime.start_time}
                        </span>
                      </TableCell>
                      <TableCell>{showtime.end_time}</TableCell>
                      <TableCell>${showtime.price.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(showtime.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(showtime)}
                            disabled={showtime.status === 'cancelled'}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(showtime)}
                            className="text-destructive hover:text-destructive"
                            disabled={showtime.status === 'cancelled'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedShowtime ? 'Editar Funcion' : 'Nueva Funcion'}
            </DialogTitle>
            <DialogDescription>
              {selectedShowtime ? 'Modifica los datos de la funcion' : 'Programa una nueva funcion'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Pelicula *</Label>
              <Select
                value={formData.movie_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, movie_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar pelicula" />
                </SelectTrigger>
                <SelectContent>
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id.toString()}>
                      {movie.title} ({movie.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Sala *</Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => setFormData({ ...formData, room: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Día *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_time">Hora de Inicio *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio (COP) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              * La hora de fin se calcula automaticamente basada en la duracion de la pelicula.
              El sistema validara que no haya traslapes con otras funciones en la misma sala.
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Funcion</DialogTitle>
            <DialogDescription>
              ¿Estas seguro de que deseas cancelar esta funcion?
              Los tiquetes vendidos deberan ser reembolsados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Volver
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Cancelando...' : 'Cancelar Funcion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}