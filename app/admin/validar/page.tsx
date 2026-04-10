'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, CheckCircle, XCircle, AlertTriangle, QrCode, Camera, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ValidationResult {
  success: boolean
  status: 'valid' | 'used' | 'cancelled' | 'expired' | 'invalid'
  message: string
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

export default function AdminValidatePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [recentValidations, setRecentValidations] = useState<ValidationResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const cleanCode = code.replace('JHOCEAN Films:', '').trim()
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode })
      })

      const data = await res.json()

      const validationResult: ValidationResult = {
        success: data.success,
        status: data.status || (data.success ? 'valid' : 'invalid'),
        message: data.message || data.error || '',
        data: data.data
      }

      setResult(validationResult)
      
      // Add to recent validations
      setRecentValidations(prev => [validationResult, ...prev.slice(0, 9)])

      // Clear input for next scan
      setCode('')
      inputRef.current?.focus()

    } catch {
      setResult({
        success: false,
        status: 'invalid',
        message: 'Error de conexion'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = (validation: ValidationResult) => {
    const statusConfig = {
      valid: {
        icon: CheckCircle,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success',
        title: 'ACCESO PERMITIDO'
      },
      used: {
        icon: AlertTriangle,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning',
        title: 'YA UTILIZADO'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive',
        title: 'CANCELADO'
      },
      expired: {
        icon: XCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive',
        title: 'EXPIRADO'
      },
      invalid: {
        icon: XCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive',
        title: 'NO VALIDO'
      }
    }

    const config = statusConfig[validation.status] || statusConfig.invalid
    const Icon = config.icon

    return { config, Icon }
  }

  const renderResult = () => {
    if (!result) return null

    const { config, Icon } = getStatusDisplay(result)

    return (
      <div className={`rounded-xl border-4 ${config.borderColor} ${config.bgColor} p-8 text-center transition-all`}>
        <Icon className={`mx-auto h-24 w-24 ${config.color}`} />
        <h2 className={`mt-4 text-3xl font-bold ${config.color}`}>{config.title}</h2>
        <p className="mt-2 text-lg text-muted-foreground">{result.message}</p>

        {result.data && result.success && (
          <div className="mt-6 rounded-lg bg-card p-4 text-left">
            <div className="grid gap-3 text-lg">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold text-card-foreground">{result.data.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Pelicula:</span>
                <span className="font-semibold text-card-foreground">{result.data.movie}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Sala:</span>
                <span className="font-semibold text-card-foreground">{result.data.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asiento:</span>
                <span className="font-bold text-2xl text-primary">{result.data.seat}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Validar Tiquetes</h1>
        <p className="text-muted-foreground">Escanea o ingresa el codigo del tiquete para validar entrada</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main validation area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Escaner de Tiquetes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual" className="gap-2">
                    <Keyboard className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="gap-2" disabled>
                    <Camera className="h-4 w-4" />
                    Camara (Pronto)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="mt-4">
                  <form onSubmit={handleValidate} className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Escanea o ingresa el codigo del tiquete..."
                        className="text-lg font-mono h-12"
                        autoComplete="off"
                      />
                      <Button type="submit" size="lg" disabled={loading || !code.trim()}>
                        {loading ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : (
                          <>
                            <Search className="h-5 w-5 mr-2" />
                            Validar
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      El cursor esta enfocado en el campo. Escanea el codigo QR del tiquete para validarlo automaticamente.
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="camera" className="mt-4">
                  <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Escaner de camara proximamente</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Result display */}
              <div className="mt-6">
                {result ? (
                  renderResult()
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20">
                    <div className="text-center">
                      <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Escanea un tiquete para validarlo</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent validations */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Validaciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentValidations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay validaciones recientes
                </p>
              ) : (
                <div className="space-y-3">
                  {recentValidations.map((validation, index) => {
                    const { config, Icon } = getStatusDisplay(validation)
                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 rounded-lg ${config.bgColor} p-3`}
                      >
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-medium text-card-foreground truncate">
                            {validation.data?.ticket_code || 'Desconocido'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {validation.data?.customer_name || validation.message}
                          </p>
                        </div>
                        <span className={`text-xs font-medium ${config.color}`}>
                          {config.title.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
