'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Film, Calendar, Ticket, TrendingUp, Users, 
  DollarSign, BarChart3, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import type { DashboardStats } from '@/lib/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando estadisticas...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('es-CO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Peliculas Activas</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalMovies || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Film className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Link href="/admin/peliculas">
              <Button variant="ghost" size="sm" className="mt-4 w-full gap-2">
                Ver peliculas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Funciones Programadas</p>
                <p className="text-3xl font-bold text-foreground">{stats?.activeShowtimes || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
            <Link href="/admin/funciones">
              <Button variant="ghost" size="sm" className="mt-4 w-full gap-2">
                Ver funciones
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiquetes Hoy</p>
                <p className="text-3xl font-bold text-foreground">{stats?.ticketsSoldToday || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Ticket className="h-6 w-6 text-success" />
              </div>
            </div>
            <Link href="/admin/tiquetes">
              <Button variant="ghost" size="sm" className="mt-4 w-full gap-2">
                Ver tiquetes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Hoy</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.revenueToday || 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">
                Total: {formatCurrency(stats?.totalRevenue || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Sales by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ventas por Dia (Ultimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.salesByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={formatDate}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'sales' ? 'Tiquetes' : 'Ingresos'
                    ]}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ingresos por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.salesByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={formatDate}
                    formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Movies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Peliculas Mas Vendidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topMovies && stats.topMovies.length > 0 ? (
              <div className="space-y-4">
                {stats.topMovies.map((movie, index) => (
                  <div key={movie.title} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">{movie.title}</p>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div 
                          className="h-2 rounded-full bg-primary"
                          style={{ 
                            width: `${(movie.tickets / (stats.topMovies[0]?.tickets || 1)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {movie.tickets} tiquetes
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Film className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No hay datos de ventas todavia</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tasa de Ocupacion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <svg className="h-40 w-40 -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="12"
                    strokeDasharray={`${(stats?.occupancyRate || 0) * 4.4} 440`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">
                    {(stats?.occupancyRate || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="mt-4 text-center text-muted-foreground">
                Porcentaje de asientos vendidos vs disponibles
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Acciones Rapidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/peliculas">
              <Button variant="outline" className="gap-2">
                <Film className="h-4 w-4" />
                Nueva Pelicula
              </Button>
            </Link>
            <Link href="/admin/funciones">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Programar Funcion
              </Button>
            </Link>
            <Link href="/admin/validar">
              <Button variant="outline" className="gap-2">
                <Ticket className="h-4 w-4" />
                Validar Tiquetes
              </Button>
            </Link>
            <Link href="/" target="_blank">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Ver Sitio Publico
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
