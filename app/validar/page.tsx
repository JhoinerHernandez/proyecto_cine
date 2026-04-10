'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Film, Search, CheckCircle, XCircle, AlertTriangle, ArrowLeft, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface TicketStatus {
  status: 'valid' | 'used' | 'cancelled' | 'expired' | 'invalid'
  message?: string
  data?: {
    ticket_code: string
    customer_name?: string
    movie?: string
    room?: string
    date?: string
    time?: string
    seat?: string
    validated_at?: string
  }
}

export default function PublicValidatePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TicketStatus | null>(null)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const cleanCode = code.replace('JHOCEAN Films:', '').trim()
      const res = await fetch(`/api/tickets/validate?code=${encodeURIComponent(cleanCode)}`)
      const data = await res.json()

      if (data.success) {
        setResult({
          status: data.data.status as TicketStatus['status'],
          data: data.data
        })
      } else {
        setResult({
          status: 'invalid',
          message: data.error
        })
      }
    } catch {
      setResult({
        status: 'invalid',
        message: 'Error al verificar el tiquete'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = () => {
    if (!result) return null

    const statusConfig = {
      valid: {
        icon: CheckCircle,
        color: 'text-success',
        bgColor: 'bg-success/10',
        title: 'Tiquete Valido',
        description: 'Este tiquete esta activo y listo para usar'
      },
      used: {
        icon: AlertTriangle,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        title: 'Tiquete Ya Utilizado',
        description: 'Este tiquete ya fue validado anteriormente'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        title: 'Tiquete Cancelado',
        description: 'Este tiquete ha sido cancelado'
      },
      expired: {
        icon: XCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        title: 'Tiquete Expirado',
        description: 'Este tiquete es para una funcion pasada'
      },
      invalid: {
        icon: XCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        title: 'Tiquete No Valido',
        description: result.message || 'El codigo ingresado no corresponde a ningun tiquete'
      }
    }

    const config = statusConfig[result.status] || statusConfig.invalid
    const Icon = config.icon

    return (
      <div className={`rounded-lg ${config.bgColor} p-6 text-center`}>
        <Icon className={`mx-auto h-16 w-16 ${config.color}`} />
        <h2 className={`mt-4 text-xl font-bold ${config.color}`}>{config.title}</h2>
        <p className="mt-2 text-muted-foreground">{config.description}</p>

        {result.data && (
          <div className="mt-6 text-left">
            <div className="rounded-lg bg-card p-4">
              <h3 className="font-semibold text-card-foreground mb-3">Detalles del Tiquete</h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Codigo:</dt>
                  <dd className="font-mono font-medium text-card-foreground">{result.data.ticket_code}</dd>
                </div>
                {result.data.customer_name && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Cliente:</dt>
                    <dd className="text-card-foreground">{result.data.customer_name}</dd>
                  </div>
                )}
                {result.data.movie && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Pelicula:</dt>
                    <dd className="text-card-foreground">{result.data.movie}</dd>
                  </div>
                )}
                {result.data.date && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Fecha:</dt>
                    <dd className="text-card-foreground">{result.data.date}</dd>
                  </div>
                )}
                {result.data.time && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Hora:</dt>
                    <dd className="text-card-foreground">{result.data.time}</dd>
                  </div>
                )}
                {result.data.room && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sala:</dt>
                    <dd className="text-card-foreground">{result.data.room}</dd>
                  </div>
                )}
                {result.data.seat && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Asiento:</dt>
                    <dd className="text-card-foreground">{result.data.seat}</dd>
                  </div>
                )}
                {result.data.validated_at && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Validado:</dt>
                    <dd className="text-card-foreground">
                      {new Date(result.data.validated_at).toLocaleString('es-CO')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
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
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verificar Tiquete</CardTitle>
            <p className="text-muted-foreground">
              Ingresa el codigo de tu tiquete para verificar su estado
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CM-XXXXXXXX"
                  className="font-mono"
                />
                <Button type="submit" disabled={loading || !code.trim()}>
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>

            {result && (
              <div className="mt-6">
                {getStatusDisplay()}
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Para validar tiquetes en la entrada, el personal debe usar el{' '}
                <Link href="/admin/validar" className="text-primary hover:underline">
                  panel de validacion
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
