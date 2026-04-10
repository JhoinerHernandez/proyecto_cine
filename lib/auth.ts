import { cookies } from 'next/headers'
import pool from './db-mysql'
import { RowDataPacket } from 'mysql2'

const SESSION_COOKIE = 'JHOCEAN Films_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 horas

interface Session {
  userId: number
  username: string
  role: 'admin' | 'cliente'
  expiresAt: number
}

const sessions = new Map<string, Session>()

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export async function createSession(userId: number, username: string, role: 'admin' | 'cliente'): Promise<string> {
  const sessionId = generateSessionId()
  sessions.set(sessionId, {
    userId,
    username,
    role,
    expiresAt: Date.now() + SESSION_DURATION
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })

  return sessionId
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionId) return null

  const session = sessions.get(sessionId)
  if (!session) return null

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId)
    return null
  }

  return session
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (sessionId) sessions.delete(sessionId)
  cookieStore.delete(SESSION_COOKIE)
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<{ userId: number; username: string; role: 'admin' | 'cliente' } | null> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nombre, email, rol FROM usuarios WHERE email = ? AND password = ?',
      [email, password]
    )

    if (rows.length === 0) return null

    const user = rows[0]
    return {
      userId: user.id,
      username: user.nombre,
      role: user.rol as 'admin' | 'cliente'
    }
  } catch (error) {
    console.error('Error validando credenciales:', error)
    return null
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) throw new Error('No autorizado')
  return session
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  if (session.role !== 'admin') throw new Error('Acceso solo para administradores')
  return session
}