// Database mock for development
// In production, replace with actual MySQL connection using mysql2

import type { Movie, Showtime, Seat, Ticket, Admin, DashboardStats } from './types'

// Persistencia global para desarrollo con Next.js
declare global {
  var __showtimesData: Showtime[] | undefined
  var __seatsData: Seat[] | undefined
  var __ticketsData: Ticket[] | undefined
}

const moviesData: Movie[] = [
  {
    id: 1,
    title: 'Benjamin el Relojero',
    genre: 'Animacion',
    duration: 169,
    synopsis: 'Las flipantes aventuras de Benjamin, un chico con un reloj magico que le permite transformarse en poderosos aliens para defender la Tierra de amenazas extraterrestres.',
    poster_url: '/Benjamin el relojero.jpeg',
    rating: 'PG',
    release_date: '2024-11-07',
    director: 'Man of Action',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'El Prisas',
    genre: 'Accion',
    duration: 142,
    synopsis: 'El erizo mas veloz del mundo regresa en una nueva aventura llena de velocidad, accion y amistad. Nada lo puede detener.',
    poster_url: '/El prisas.jpeg',
    rating: 'PG',
    release_date: '2024-10-15',
    director: 'Jeff Fowler',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Toy Serio',
    genre: 'Animacion',
    duration: 118,
    synopsis: 'Woody y Buzz regresan en una aventura mas intensa que nunca. Los juguetes deben enfrentar su mayor reto: crecer.',
    poster_url: '/Toy serio.jpeg',
    rating: 'PG',
    release_date: '2024-09-20',
    director: 'Pixar Studios',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Maduro Extraction',
    genre: 'Accion',
    duration: 95,
    synopsis: 'Un operativo de extraccion de alto riesgo en territorio desconocido. Cada segundo cuenta y no hay marcha atras.',
    poster_url: '/Maduro extracion.jpeg',
    rating: 'R',
    release_date: '2024-10-31',
    director: 'Sam Hargrave',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'La Venganza de los Chamos 3',
    genre: 'Accion',
    duration: 105,
    synopsis: 'Mas recargados que nunca. Los chamos regresan con todo en la tercera entrega de la saga mas epica del verano venezolano.',
    poster_url: '/la-venganza-chamos-3.jpeg',
    rating: 'PG-13',
    release_date: '2024-12-01',
    director: 'Memes Venezolanos',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    title: 'El Estafador Secreto',
    genre: 'Suspenso',
    duration: 128,
    synopsis: 'Solo en Ticketmaster. Un hombre con una sonrisa perfecta esconde el mayor esquema de estafa jamas visto. Nadie sospecha de el.',
    poster_url: '/El estafador secreto.jpeg',
    rating: 'PG-13',
    release_date: '2024-11-15',
    director: 'David Fincher',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const getDateString = (daysOffset: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

const calcEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMins = totalMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
}

// Sala asignada por película
const movieRooms: Record<number, string> = {
  1: 'Sala 1',
  2: 'Sala 2',
  3: 'Sala 3',
  4: 'Sala 4',
  5: 'Sala 1',
  6: 'Sala 2',
}

// Precio por hora
const timePrices: Record<string, number> = {
  '14:00': 12000,
  '18:00': 15000,
  '22:00': 18000,
}

const generateInitialShowtimes = (): Showtime[] => {
  const showtimes: Showtime[] = []
  let id = 1
  for (let day = 0; day < 7; day++) {
    const date = getDateString(day)
    for (const movie of moviesData) {
      const room = movieRooms[movie.id]
      for (const startTime of ['14:00', '18:00', '22:00']) {
        showtimes.push({
          id: id++,
          movie_id: movie.id,
          room,
          date,
          start_time: startTime,
          end_time: calcEndTime(startTime, movie.duration),
          price: timePrices[startTime],
          status: 'scheduled',
          created_at: new Date().toISOString()
        })
      }
    }
  }
  return showtimes
}

function generateSeatsClean(showtimeId: number): Seat[] {
  const seats: Seat[] = []
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  let seatId = showtimeId * 1000
  for (const row of rows) {
    for (let num = 1; num <= 15; num++) {
      seats.push({
        id: seatId++,
        showtime_id: showtimeId,
        row_letter: row,
        seat_number: num,
        status: 'available'
      })
    }
  }
  return seats
}

const generateSeats = (showtimeId: number): Seat[] => {
  const seats: Seat[] = []
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  let seatId = showtimeId * 1000
  for (const row of rows) {
    for (let num = 1; num <= 15; num++) {
      const random = Math.random()
      const status: Seat['status'] = random < 0.15 ? 'sold' : random < 0.2 ? 'reserved' : 'available'
      seats.push({
        id: seatId++,
        showtime_id: showtimeId,
        row_letter: row,
        seat_number: num,
        status
      })
    }
  }
  return seats
}

// Inicializar datos globales
if (!global.__showtimesData) {
  global.__showtimesData = generateInitialShowtimes()
}

if (!global.__seatsData) {
  global.__seatsData = []
  global.__showtimesData.forEach(showtime => {
    global.__seatsData = [...global.__seatsData!, ...generateSeats(showtime.id)]
  })
}

if (!global.__ticketsData) {
  global.__ticketsData = []
}

const showtimesData = global.__showtimesData
let seatsData = global.__seatsData
let ticketsData = global.__ticketsData

const adminsData: Admin[] = [
  {
    id: 1,
    username: 'admin',
    password_hash: '$2b$10$rQZ8kHxL5YxBvqHt7.ZPxe5ZHqGxZJZJZJZJZJZJZJZJZJZJZJZJZ',
    name: 'Administrador Principal',
    email: 'admin@JHOCEAN Films.com',
    role: 'admin',
    created_at: new Date().toISOString(),
    last_login: null
  },
  {
    id: 2,
    username: 'validator',
    password_hash: '$2b$10$rQZ8kHxL5YxBvqHt7.ZPxe5ZHqGxZJZJZJZJZJZJZJZJZJZJZJZJZ',
    name: 'Validador de Tiquetes',
    email: 'validator@JHOCEAN Films.com',
    role: 'validator',
    created_at: new Date().toISOString(),
    last_login: null
  }
]

export const db = {
  movies: {
    findAll: (): Movie[] => moviesData.filter(m => m.status === 'active'),
    findAllIncludingInactive: (): Movie[] => [...moviesData],
    findById: (id: number): Movie | undefined => moviesData.find(m => m.id === id),
    create: (movie: Omit<Movie, 'id' | 'created_at' | 'updated_at'>): Movie => {
      const newMovie: Movie = {
        ...movie,
        id: Math.max(...moviesData.map(m => m.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      moviesData.push(newMovie)
      return newMovie
    },
    update: (id: number, updates: Partial<Movie>): Movie | undefined => {
      const index = moviesData.findIndex(m => m.id === id)
      if (index === -1) return undefined
      moviesData[index] = { ...moviesData[index], ...updates, updated_at: new Date().toISOString() }
      return moviesData[index]
    },
    delete: (id: number): boolean => {
      const index = moviesData.findIndex(m => m.id === id)
      if (index === -1) return false
      moviesData[index].status = 'inactive'
      return true
    }
  },

  showtimes: {
    findAll: (): Showtime[] => showtimesData.filter(s => s.status !== 'cancelled'),
    findById: (id: number): Showtime | undefined => {
      const showtime = showtimesData.find(s => s.id === id)
      if (showtime) {
        showtime.movie = moviesData.find(m => m.id === showtime.movie_id)
      }
      return showtime
    },
    findByDate: (date: string): Showtime[] => {
      return showtimesData
        .filter(s => s.date === date && s.status !== 'cancelled')
        .map(s => ({ ...s, movie: moviesData.find(m => m.id === s.movie_id) }))
    },
    findByMovieAndRoom: (movieId: number, room: string, date: string): Showtime[] => {
      return showtimesData.filter(s =>
        s.movie_id === movieId && s.room === room && s.date === date && s.status !== 'cancelled'
      )
    },
    checkOverlap: (room: string, date: string, startTime: string, endTime: string, excludeId?: number): boolean => {
      return showtimesData.some(s => {
        if (s.room !== room || s.date !== date || s.status === 'cancelled') return false
        if (excludeId && s.id === excludeId) return false
        return !(endTime <= s.start_time || startTime >= s.end_time)
      })
    },
    create: (showtime: Omit<Showtime, 'id' | 'created_at' | 'status'>): Showtime => {
      const newShowtime: Showtime = {
        ...showtime,
        id: Math.max(...showtimesData.map(s => s.id)) + 1,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
      showtimesData.push(newShowtime)
      const newSeats = generateSeatsClean(newShowtime.id)
      global.__seatsData = [...global.__seatsData!, ...newSeats]
      seatsData = global.__seatsData
      return newShowtime
    },
    update: (id: number, updates: Partial<Showtime>): Showtime | undefined => {
      const index = showtimesData.findIndex(s => s.id === id)
      if (index === -1) return undefined
      showtimesData[index] = { ...showtimesData[index], ...updates }
      return showtimesData[index]
    },
    cancel: (id: number): boolean => {
      const index = showtimesData.findIndex(s => s.id === id)
      if (index === -1) return false
      showtimesData[index].status = 'cancelled'
      return true
    }
  },

  seats: {
    findByShowtime: (showtimeId: number): Seat[] => seatsData.filter(s => s.showtime_id === showtimeId),
    findById: (id: number): Seat | undefined => seatsData.find(s => s.id === id),
    findByIds: (ids: number[]): Seat[] => seatsData.filter(s => ids.includes(s.id)),
    updateStatus: (ids: number[], status: Seat['status']): boolean => {
      ids.forEach(id => {
        const seat = seatsData.find(s => s.id === id)
        if (seat) seat.status = status
      })
      return true
    },
    getAvailableCount: (showtimeId: number): number => {
      return seatsData.filter(s => s.showtime_id === showtimeId && s.status === 'available').length
    }
  },

  tickets: {
    findAll: (): Ticket[] => ticketsData,
    findById: (id: number): Ticket | undefined => ticketsData.find(t => t.id === id),
    findByCode: (code: string): Ticket | undefined => {
      const ticket = ticketsData.find(t => t.ticket_code === code)
      if (ticket) {
        ticket.showtime = showtimesData.find(s => s.id === ticket.showtime_id)
        if (ticket.showtime) {
          ticket.showtime.movie = moviesData.find(m => m.id === ticket.showtime!.movie_id)
        }
        ticket.seat = seatsData.find(s => s.id === ticket.seat_id)
      }
      return ticket
    },
    findByShowtime: (showtimeId: number): Ticket[] => ticketsData.filter(t => t.showtime_id === showtimeId),
    create: (ticket: Omit<Ticket, 'id' | 'purchase_date' | 'validated_at'>): Ticket => {
      const newTicket: Ticket = {
        ...ticket,
        id: ticketsData.length > 0 ? Math.max(...ticketsData.map(t => t.id)) + 1 : 1,
        purchase_date: new Date().toISOString(),
        validated_at: null
      }
      ticketsData.push(newTicket)
      global.__ticketsData = ticketsData
      return newTicket
    },
    validate: (code: string): Ticket | undefined => {
      const ticket = ticketsData.find(t => t.ticket_code === code)
      if (ticket && ticket.status === 'active') {
        ticket.status = 'used'
        ticket.validated_at = new Date().toISOString()
        return ticket
      }
      return undefined
    },
    cancel: (id: number): boolean => {
      const ticket = ticketsData.find(t => t.id === id)
      if (ticket) {
        ticket.status = 'cancelled'
        const seat = seatsData.find(s => s.id === ticket.seat_id)
        if (seat) seat.status = 'available'
        return true
      }
      return false
    },
    getTodaySales: (): { count: number; revenue: number } => {
      const today = getDateString(0)
      const todayTickets = ticketsData.filter(t =>
        t.purchase_date.startsWith(today) && t.status !== 'cancelled'
      )
      return {
        count: todayTickets.length,
        revenue: todayTickets.reduce((sum, t) => sum + t.price, 0)
      }
    }
  },

  admins: {
    findByUsername: (username: string): Admin | undefined => adminsData.find(a => a.username === username),
    updateLastLogin: (id: number): void => {
      const admin = adminsData.find(a => a.id === id)
      if (admin) admin.last_login = new Date().toISOString()
    }
  },

  getStats: (): DashboardStats => {
    const today = getDateString(0)
    const todaySales = db.tickets.getTodaySales()
    const totalRevenue = ticketsData.filter(t => t.status !== 'cancelled').reduce((sum, t) => sum + t.price, 0)
    const activeShowtimes = showtimesData.filter(s => s.date >= today && s.status === 'scheduled').length
    const totalSeats = seatsData.length
    const soldSeats = seatsData.filter(s => s.status === 'sold').length
    const occupancyRate = totalSeats > 0 ? (soldSeats / totalSeats) * 100 : 0

    const movieTickets: Record<number, number> = {}
    ticketsData.filter(t => t.status !== 'cancelled').forEach(t => {
      const showtime = showtimesData.find(s => s.id === t.showtime_id)
      if (showtime) {
        movieTickets[showtime.movie_id] = (movieTickets[showtime.movie_id] || 0) + 1
      }
    })
    const topMovies = Object.entries(movieTickets)
      .map(([movieId, tickets]) => ({
        title: moviesData.find(m => m.id === parseInt(movieId))?.title || 'Desconocido',
        tickets
      }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5)

    const salesByDay: DashboardStats['salesByDay'] = []
    for (let i = 6; i >= 0; i--) {
      const date = getDateString(-i)
      const dayTickets = ticketsData.filter(t => t.purchase_date.startsWith(date) && t.status !== 'cancelled')
      salesByDay.push({
        date,
        sales: dayTickets.length,
        revenue: dayTickets.reduce((sum, t) => sum + t.price, 0)
      })
    }

    return {
      totalMovies: moviesData.filter(m => m.status === 'active').length,
      activeShowtimes,
      ticketsSoldToday: todaySales.count,
      totalRevenue,
      revenueToday: todaySales.revenue,
      occupancyRate,
      topMovies,
      salesByDay
    }
  }
}

export function generateTicketCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'CM-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}