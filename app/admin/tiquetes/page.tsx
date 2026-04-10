'use client'

import { useState, useEffect } from 'react'
import { Search, Ticket, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import type { Ticket as TicketType } from '@/lib/types'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/tickets')
        const data = await res.json()
        if (data.success) {
          setTickets(data.data)
        }
      } catch (err) {
        console.error('Error fetching tickets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_code.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customer_email.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: TicketType['status']) => {
    const styles = {
      active: { color: 'text-success', bg: 'bg-success/10', icon: Clock, label: 'Activo' },
      used: { color: 'text-primary', bg: 'bg-primary/10', icon: CheckCircle, label: 'Usado' },
      cancelled: { color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle, label: 'Cancelado' }
    }
    const style = styles[status]
    const Icon = style.icon

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${style.bg} ${style.color}`}>
        <Icon className="h-3 w-3" />
        {style.label}
      </span>
    )
  }

  // Stats
  const stats = {
    total: tickets.length,
    active: tickets.filter(t => t.status === 'active').length,
    used: tickets.filter(t => t.status === 'used').length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length,
    revenue: tickets.filter(t => t.status !== 'cancelled').reduce((sum, t) => sum + t.price, 0)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tiquetes</h1>
        <p className="text-muted-foreground">Gestiona todos los tiquetes vendidos</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-success">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usados</p>
                <p className="text-2xl font-bold text-primary">{stats.used}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold text-accent">${stats.revenue.toLocaleString()}</p>
              </div>
              <Ticket className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por codigo, nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="used">Usados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tiquetes ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <Ticket className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No se encontraron tiquetes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Codigo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Fecha Compra</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono font-medium">
                        {ticket.ticket_code}
                      </TableCell>
                      <TableCell>{ticket.customer_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.customer_email}
                      </TableCell>
                      <TableCell>${ticket.price.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(ticket.purchase_date).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
