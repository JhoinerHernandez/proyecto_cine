// Database Types for Cinema Management System

export interface Movie {
  id: number
  title: string
  genre: string
  duration: number // minutes
  synopsis: string
  poster_url: string
  rating: string
  release_date: string
  director: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Showtime {
  id: number
  movie_id: number
  room: string
  date: string
  start_time: string
  end_time: string
  price: number
  status: 'scheduled' | 'ongoing' | 'finished' | 'cancelled'
  created_at: string
  // Joined fields
  movie?: Movie
}

export interface Seat {
  id: number
  showtime_id: number
  row_letter: string
  seat_number: number
  status: 'available' | 'reserved' | 'sold'
}

export interface Ticket {
  id: number
  showtime_id: number
  seat_id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  ticket_code: string
  qr_code: string
  price: number
  status: 'active' | 'used' | 'cancelled'
  purchase_date: string
  validated_at: string | null
  // Joined fields
  showtime?: Showtime
  seat?: Seat
}

export interface Admin {
  id: number
  username: string
  password_hash: string
  name: string
  email: string
  role: 'admin' | 'validator'
  created_at: string
  last_login: string | null
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Statistics types
export interface DashboardStats {
  totalMovies: number
  activeShowtimes: number
  ticketsSoldToday: number
  totalRevenue: number
  revenueToday: number
  occupancyRate: number
  topMovies: { title: string; tickets: number }[]
  salesByDay: { date: string; sales: number; revenue: number }[]
}

// Form types
export interface MovieFormData {
  title: string
  genre: string
  duration: number
  synopsis: string
  poster_url: string
  rating: string
  release_date: string
  director: string
  status: 'active' | 'inactive'
}

export interface ShowtimeFormData {
  movie_id: number
  room: string
  date: string
  start_time: string
  price: number
}

export interface TicketPurchaseData {
  showtime_id: number
  seats: number[]
  customer_name: string
  customer_email: string
  customer_phone: string
}
