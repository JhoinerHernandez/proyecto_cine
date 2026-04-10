'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Search, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import type { Movie, MovieFormData } from '@/lib/types'

const genres = [
  'Accion', 'Aventura', 'Animacion', 'Ciencia Ficcion', 'Comedia', 
  'Drama', 'Fantasia', 'Romance', 'Suspenso', 'Terror'
]

const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17']

const emptyForm: MovieFormData = {
  title: '',
  genre: '',
  duration: 120,
  synopsis: '',
  poster_url: '',
  rating: 'PG',
  release_date: new Date().toISOString().split('T')[0],
  director: '',
  status: 'active'
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [formData, setFormData] = useState<MovieFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/movies')
      const data = await res.json()
      if (data.success) {
        setMovies(data.data)
      }
    } catch (err) {
      console.error('Error fetching movies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(search.toLowerCase()) ||
    movie.genre.toLowerCase().includes(search.toLowerCase())
  )

  const openCreateDialog = () => {
    setSelectedMovie(null)
    setFormData(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEditDialog = (movie: Movie) => {
    setSelectedMovie(movie)
    setFormData({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      synopsis: movie.synopsis,
      poster_url: movie.poster_url,
      rating: movie.rating,
      release_date: movie.release_date,
      director: movie.director,
      status: movie.status
    })
    setError('')
    setDialogOpen(true)
  }

  const openDeleteDialog = (movie: Movie) => {
    setSelectedMovie(movie)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = selectedMovie ? `/api/movies/${selectedMovie.id}` : '/api/movies'
      const method = selectedMovie ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setDialogOpen(false)
        fetchMovies()
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
    if (!selectedMovie) return
    setSaving(true)

    try {
      const res = await fetch(`/api/movies/${selectedMovie.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        setDeleteDialogOpen(false)
        fetchMovies()
      } else {
        setError(data.error || 'Error al eliminar')
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Peliculas</h1>
          <p className="text-muted-foreground">Gestiona el catalogo de peliculas</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Pelicula
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por titulo o genero..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Movies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catalogo ({filteredMovies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <Film className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No se encontraron peliculas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Poster</TableHead>
                    <TableHead>Titulo</TableHead>
                    <TableHead>Genero</TableHead>
                    <TableHead>Duracion</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies.map((movie) => (
                    <TableRow key={movie.id}>
                      <TableCell>
                        <div className="relative h-16 w-12 overflow-hidden rounded">
                          <Image
                            src={movie.poster_url}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{movie.title}</TableCell>
                      <TableCell>{movie.genre}</TableCell>
                      <TableCell>{movie.duration} min</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                          {movie.rating}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          movie.status === 'active' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {movie.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(movie)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(movie)}
                            className="text-destructive hover:text-destructive"
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMovie ? 'Editar Pelicula' : 'Nueva Pelicula'}
            </DialogTitle>
            <DialogDescription>
              {selectedMovie ? 'Modifica los datos de la pelicula' : 'Ingresa los datos de la nueva pelicula'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Titulo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genero *</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => setFormData({ ...formData, genre: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar genero" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duracion (min) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Clasificacion</Label>
                <Select
                  value={formData.rating}
                  onValueChange={(value) => setFormData({ ...formData, rating: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar clasificacion" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratings.map((rating) => (
                      <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="release_date">Fecha de Estreno</Label>
                <Input
                  id="release_date"
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="poster_url">URL del Poster</Label>
                <Input
                  id="poster_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.poster_url}
                  onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="synopsis">Sinopsis</Label>
                <Textarea
                  id="synopsis"
                  rows={3}
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
            <DialogTitle>Eliminar Pelicula</DialogTitle>
            <DialogDescription>
              ¿Estas seguro de que deseas eliminar &quot;{selectedMovie?.title}&quot;? 
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
