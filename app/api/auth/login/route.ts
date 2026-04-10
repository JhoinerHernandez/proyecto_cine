import { NextRequest, NextResponse } from 'next/server'
import { createSession, validateCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await validateCredentials(username, password)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    await createSession(user.userId, user.username, user.role)

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesion exitoso',
      data: {
        nombre: user.username,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al iniciar sesion' },
      { status: 500 }
    )
  }
}