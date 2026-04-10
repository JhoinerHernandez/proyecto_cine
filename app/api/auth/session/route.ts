import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ success: false, authenticated: false })
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        username: session.username,
        role: session.role,
        name: session.username
      }
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ success: false, authenticated: false })
  }
}