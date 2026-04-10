import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const stats = db.getStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener estadisticas' }, { status: 500 })
  }
}
