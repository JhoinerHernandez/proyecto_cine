import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db-mysql'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password } = await req.json()

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const [existing] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    ) as any

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Este correo ya está registrado' },
        { status: 400 }
      )
    }

    // Crear usuario
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password, 'cliente']
    ) as any

    // Crear sesión automáticamente
    await createSession(result.insertId, nombre, 'cliente')

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}