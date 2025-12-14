import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Auth Store with User Registration
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      registeredUsers: [
        // Default admin user
        {
          id: 1,
          name: 'Admin',
          email: 'admin@outlook.com',
          phone: '081234567890',
          password: 'admin123',
          role: 'admin',
        },
        // Default user for testing
        {
          id: 2,
          name: 'John Doe',
          email: 'john@email.com',
          phone: '081234567891',
          password: 'user123',
          role: 'user',
        },
      ],

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),

      // Register new user
      register: (userData) => {
        const { registeredUsers } = get()
        
        // Check if email already exists
        const existingUser = registeredUsers.find(
          (u) => u.email.toLowerCase() === userData.email.toLowerCase()
        )
        
        if (existingUser) {
          return { success: false, message: 'Email sudah terdaftar' }
        }
        
        const newUser = {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          role: 'user',
        }
        
        set({ registeredUsers: [...registeredUsers, newUser] })
        
        return { success: true, user: newUser }
      },

      // Login with validation
      loginWithCredentials: (email, password) => {
        const { registeredUsers } = get()
        
        const user = registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        
        if (!user) {
          return { success: false, message: 'Email atau password salah' }
        }
        
        const { password: _, ...userWithoutPassword } = user
        set({ 
          user: userWithoutPassword, 
          token: 'token-' + Date.now(), 
          isAuthenticated: true, 
          isLoading: false 
        })
        
        return { success: true, user: userWithoutPassword }
      },

      login: (user, token) => {
        set({ user, token, isAuthenticated: true, isLoading: false })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      },

      // Check if email exists
      emailExists: (email) => {
        const { registeredUsers } = get()
        return registeredUsers.some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        )
      },
    }),
    {
      name: 'outlook-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
)

// Booking Store
export const useBookingStore = create((set, get) => ({
  // Booking Form State
  currentStep: 1,
  selectedServices: [],
  selectedBarber: null,
  selectedDate: null,
  selectedTime: null,
  customerInfo: {
    name: '',
    email: '',
    phone: '',
    notes: '',
  },

  // Actions
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  // Service Selection
  toggleService: (service) => {
    const { selectedServices } = get()
    const isSelected = selectedServices.some((s) => s.id === service.id)

    if (isSelected) {
      set({ selectedServices: selectedServices.filter((s) => s.id !== service.id) })
    } else {
      set({ selectedServices: [...selectedServices, service] })
    }
  },

  clearServices: () => set({ selectedServices: [] }),

  // Barber Selection
  setBarber: (barber) => set({ selectedBarber: barber }),
  clearBarber: () => set({ selectedBarber: null }),

  // Date & Time Selection
  setDate: (date) => set({ selectedDate: date, selectedTime: null }),
  setTime: (time) => set({ selectedTime: time }),

  // Customer Info
  setCustomerInfo: (info) =>
    set((state) => ({
      customerInfo: { ...state.customerInfo, ...info },
    })),

  // Computed Values
  getTotalPrice: () => {
    const { selectedServices } = get()
    return selectedServices.reduce((total, service) => total + service.price, 0)
  },

  getTotalDuration: () => {
    const { selectedServices } = get()
    return selectedServices.reduce((total, service) => total + service.duration, 0)
  },

  // Reset
  resetBooking: () =>
    set({
      currentStep: 1,
      selectedServices: [],
      selectedBarber: null,
      selectedDate: null,
      selectedTime: null,
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        notes: '',
      },
    }),

  // Validation
  canProceed: () => {
    const {
      currentStep,
      selectedServices,
      selectedBarber,
      selectedDate,
      selectedTime,
    } = get()

    switch (currentStep) {
      case 1:
        return selectedServices.length > 0
      case 2:
        return selectedBarber !== null
      case 3:
        return selectedDate !== null && selectedTime !== null
      case 4:
        return true // Customer info validation handled by form
      default:
        return true
    }
  },
}))

// UI Store
export const useUIStore = create((set) => ({
  // Sidebar
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),

  // Mobile Menu
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Modal
  activeModal: null,
  modalData: null,
  openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Theme
  theme: 'dark',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    })),
}))

// History Store (for booking history)
export const useHistoryStore = create(
  persist(
    (set, get) => ({
      bookings: [],

      // Add new booking
      addBooking: (booking) => {
        set((state) => ({
          bookings: [booking, ...state.bookings],
        }))
      },

      // Update booking status
      updateBookingStatus: (bookingId, status) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status } : b
          ),
        }))
      },

      // Get booking by ID
      getBookingById: (bookingId) => {
        const { bookings } = get()
        return bookings.find((b) => b.id === bookingId)
      },

      // Clear all bookings
      clearBookings: () => set({ bookings: [] }),
    }),
    {
      name: 'outlook-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Team Store (for barbers)
const INITIAL_BARBERS = [
  {
    id: 1,
    name: 'Ahmad Rizky',
    role: 'Master Barber',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    experience: 8,
    rating: 4.9,
    totalClients: 2500,
    specializations: ['Fade', 'Pompadour', 'Classic Cut'],
    bio: 'Dengan pengalaman lebih dari 8 tahun, Ahmad adalah master barber yang ahli dalam berbagai teknik.',
    instagram: '@ahmadrizky.barber',
    phone: '081234567890',
    isAvailable: true,
    workSchedule: { startTime: '09:00', endTime: '20:00' },
  },
  {
    id: 2,
    name: 'Budi Santoso',
    role: 'Senior Barber',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    experience: 6,
    rating: 4.8,
    totalClients: 1800,
    specializations: ['Beard Styling', 'Hot Towel Shave', 'Skin Fade'],
    bio: 'Budi adalah spesialis dalam perawatan jenggot dan teknik cukur premium.',
    instagram: '@budisantoso.barber',
    phone: '081234567891',
    isAvailable: true,
    workSchedule: { startTime: '09:00', endTime: '18:00' },
  },
  {
    id: 3,
    name: 'Dimas Pratama',
    role: 'Creative Barber',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    experience: 5,
    rating: 4.7,
    totalClients: 1500,
    specializations: ['Hair Design', 'Color', 'Modern Styles'],
    bio: 'Dimas adalah barber kreatif yang selalu up-to-date dengan tren terbaru.',
    instagram: '@dimaspratama.barber',
    phone: '081234567892',
    isAvailable: true,
    workSchedule: { startTime: '10:00', endTime: '19:00' },
  },
  {
    id: 4,
    name: 'Eko Wijaya',
    role: 'Barber',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    experience: 4,
    rating: 4.6,
    totalClients: 1200,
    specializations: ['Kids Haircut', 'Basic Cut', 'Styling'],
    bio: 'Eko dikenal dengan keramahannya, terutama dalam menangani klien anak-anak.',
    instagram: '@ekowijaya.barber',
    phone: '081234567893',
    isAvailable: false,
    workSchedule: { startTime: '09:00', endTime: '17:00' },
  },
]

export const useTeamStore = create(
  persist(
    (set, get) => ({
      barbers: INITIAL_BARBERS,

      // Add new barber
      addBarber: (barber) => {
        set((state) => ({
          barbers: [...state.barbers, { ...barber, id: Date.now() }],
        }))
      },

      // Update barber
      updateBarber: (barberId, updates) => {
        set((state) => ({
          barbers: state.barbers.map((b) =>
            b.id === barberId ? { ...b, ...updates } : b
          ),
        }))
      },

      // Delete barber
      deleteBarber: (barberId) => {
        set((state) => ({
          barbers: state.barbers.filter((b) => b.id !== barberId),
        }))
      },

      // Toggle availability
      toggleAvailability: (barberId) => {
        set((state) => ({
          barbers: state.barbers.map((b) =>
            b.id === barberId ? { ...b, isAvailable: !b.isAvailable } : b
          ),
        }))
      },

      // Get barber by ID
      getBarberById: (barberId) => {
        const { barbers } = get()
        return barbers.find((b) => b.id === barberId)
      },

      // Get available barbers
      getAvailableBarbers: () => {
        const { barbers } = get()
        return barbers.filter((b) => b.isAvailable)
      },
    }),
    {
      name: 'outlook-team',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Services Store (for services)
const INITIAL_SERVICES = [
  {
    id: 1,
    name: 'Classic Haircut',
    description: 'Potongan rambut klasik dengan teknik gunting tradisional untuk tampilan timeless yang elegan.',
    price: 75000,
    duration: 45,
    category: 'haircut',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop',
    isActive: true,
  },
  {
    id: 2,
    name: 'Fade Haircut',
    description: 'Potongan fade modern dengan gradasi halus dari pendek ke panjang untuk look yang fresh.',
    price: 85000,
    duration: 50,
    category: 'haircut',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop',
    isActive: true,
  },
  {
    id: 3,
    name: 'Kids Haircut',
    description: 'Potongan rambut khusus anak-anak dengan pendekatan yang ramah dan menyenangkan.',
    price: 50000,
    duration: 30,
    category: 'haircut',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop',
    isActive: true,
  },
  {
    id: 4,
    name: 'Premium Shave',
    description: 'Cukur premium dengan pisau cukur tradisional, handuk panas, dan aftershave mewah.',
    price: 60000,
    duration: 30,
    category: 'shaving',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop',
    isActive: true,
  },
  {
    id: 5,
    name: 'Beard Trim',
    description: 'Rapikan dan bentuk jenggot Anda dengan presisi tinggi untuk tampilan yang rapi.',
    price: 45000,
    duration: 25,
    category: 'shaving',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=300&fit=crop',
    isActive: true,
  },
  {
    id: 6,
    name: 'Hair Styling',
    description: 'Penataan rambut profesional dengan produk styling premium untuk acara spesial.',
    price: 50000,
    duration: 20,
    category: 'styling',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=300&fit=crop',
    isActive: true,
  },
  {
    id: 7,
    name: 'Hair Coloring',
    description: 'Pewarnaan rambut profesional dengan cat berkualitas tinggi dan teknik modern.',
    price: 150000,
    duration: 90,
    category: 'treatment',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    isActive: true,
  },
  {
    id: 8,
    name: 'VIP Package',
    description: 'Paket lengkap: haircut, shave, styling, dan treatment untuk pengalaman barbershop ultimate.',
    price: 200000,
    duration: 120,
    category: 'package',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    isActive: true,
  },
]

export const useServicesStore = create(
  persist(
    (set, get) => ({
      services: INITIAL_SERVICES,

      // Add new service
      addService: (service) => {
        set((state) => ({
          services: [...state.services, { ...service, id: Date.now() }],
        }))
      },

      // Update service
      updateService: (serviceId, updates) => {
        set((state) => ({
          services: state.services.map((s) =>
            s.id === serviceId ? { ...s, ...updates } : s
          ),
        }))
      },

      // Delete service
      deleteService: (serviceId) => {
        set((state) => ({
          services: state.services.filter((s) => s.id !== serviceId),
        }))
      },

      // Toggle active status
      toggleActive: (serviceId) => {
        set((state) => ({
          services: state.services.map((s) =>
            s.id === serviceId ? { ...s, isActive: !s.isActive } : s
          ),
        }))
      },

      // Get service by ID
      getServiceById: (serviceId) => {
        const { services } = get()
        return services.find((s) => s.id === serviceId)
      },

      // Get active services
      getActiveServices: () => {
        const { services } = get()
        return services.filter((s) => s.isActive)
      },

      // Get services by category
      getServicesByCategory: (category) => {
        const { services } = get()
        if (category === 'all') return services
        return services.filter((s) => s.category === category)
      },
    }),
    {
      name: 'outlook-services',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Gallery Store (for gallery images)
const INITIAL_GALLERY = [
  { id: 1, title: 'Classic Transformation', category: 'before-after', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop', isActive: true },
  { id: 2, title: 'Fade Makeover', category: 'before-after', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop', isActive: true },
  { id: 3, title: 'Interior View', category: 'ambience', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop', isActive: true },
  { id: 4, title: 'Barber Station', category: 'ambience', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop', isActive: true },
  { id: 5, title: 'Premium Tools', category: 'tools', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop', isActive: true },
  { id: 6, title: 'Shaving Kit', category: 'tools', image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=400&h=400&fit=crop', isActive: false },
  { id: 7, title: 'Best Barbershop 2023', category: 'awards', image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=400&h=400&fit=crop', isActive: true },
  { id: 8, title: 'Styling Result', category: 'before-after', image: 'https://images.unsplash.com/photo-1560869713-bf0cd31a2478?w=400&h=400&fit=crop', isActive: true },
]

export const useGalleryStore = create(
  persist(
    (set, get) => ({
      gallery: INITIAL_GALLERY,

      // Add new gallery item
      addGalleryItem: (item) => {
        set((state) => ({
          gallery: [...state.gallery, { ...item, id: Date.now(), isActive: true }],
        }))
      },

      // Update gallery item
      updateGalleryItem: (itemId, updates) => {
        set((state) => ({
          gallery: state.gallery.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }))
      },

      // Delete gallery item
      deleteGalleryItem: (itemId) => {
        set((state) => ({
          gallery: state.gallery.filter((item) => item.id !== itemId),
        }))
      },

      // Toggle active status
      toggleActive: (itemId) => {
        set((state) => ({
          gallery: state.gallery.map((item) =>
            item.id === itemId ? { ...item, isActive: !item.isActive } : item
          ),
        }))
      },

      // Get gallery item by ID
      getGalleryItemById: (itemId) => {
        const { gallery } = get()
        return gallery.find((item) => item.id === itemId)
      },

      // Get active gallery items
      getActiveGallery: () => {
        const { gallery } = get()
        return gallery.filter((item) => item.isActive)
      },

      // Get gallery items by category
      getGalleryByCategory: (category) => {
        const { gallery } = get()
        if (category === 'all') return gallery
        return gallery.filter((item) => item.category === category)
      },
    }),
    {
      name: 'outlook-gallery',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Filter Store (for lists)
export const useFilterStore = create((set) => ({
  // Services Filter
  serviceCategory: 'all',
  serviceSearch: '',
  setServiceCategory: (category) => set({ serviceCategory: category }),
  setServiceSearch: (search) => set({ serviceSearch: search }),

  // Gallery Filter
  galleryCategory: 'all',
  setGalleryCategory: (category) => set({ galleryCategory: category }),

  // Bookings Filter (Admin)
  bookingStatus: 'all',
  bookingDateRange: { from: null, to: null },
  bookingSearch: '',
  setBookingStatus: (status) => set({ bookingStatus: status }),
  setBookingDateRange: (range) => set({ bookingDateRange: range }),
  setBookingSearch: (search) => set({ bookingSearch: search }),

  // Reset Filters
  resetFilters: () =>
    set({
      serviceCategory: 'all',
      serviceSearch: '',
      galleryCategory: 'all',
      bookingStatus: 'all',
      bookingDateRange: { from: null, to: null },
      bookingSearch: '',
    }),
}))

// Review Store
const INITIAL_REVIEWS = [
  {
    id: 1,
    odId: 1001,
    odId: 1001,
    odName: 'Andi Pratama',
    barberId: 1,
    barberName: 'Ahmad Rizky',
    rating: 5,
    comment: 'Hasil potongan sangat rapi dan sesuai dengan yang saya minta. Pelayanan ramah dan cepat!',
    services: ['Classic Haircut', 'Beard Trim'],
    createdAt: '2025-01-10T10:30:00Z',
  },
  {
    id: 2,
    odId: 1002,
    customerName: 'Budi Santoso',
    barberId: 1,
    barberName: 'Ahmad Rizky',
    rating: 5,
    comment: 'Barber terbaik! Sudah langganan hampir 2 tahun.',
    services: ['Premium Haircut'],
    createdAt: '2025-01-08T14:00:00Z',
  },
  {
    id: 3,
    customerId: 1003,
    customerName: 'Reza Wijaya',
    barberId: 2,
    barberName: 'Budi Santoso',
    rating: 4,
    comment: 'Cukur jenggotnya bagus, hot towel treatment-nya sangat relax.',
    services: ['Beard Styling', 'Hot Towel Shave'],
    createdAt: '2025-01-05T11:00:00Z',
  },
  {
    id: 4,
    customerId: 1004,
    customerName: 'Doni Setiawan',
    barberId: 3,
    barberName: 'Dimas Pratama',
    rating: 5,
    comment: 'Hair design-nya keren banget! Sesuai referensi yang saya kasih.',
    services: ['Hair Design', 'Color'],
    createdAt: '2025-01-03T16:30:00Z',
  },
]

export const useReviewStore = create(
  persist(
    (set, get) => ({
      reviews: INITIAL_REVIEWS,

      // Add new review
      addReview: (review) => {
        const newReview = {
          ...review,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }))
        return newReview
      },

      // Update review
      updateReview: (id, updates) => {
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === id ? { ...review, ...updates } : review
          ),
        }))
      },

      // Delete review
      deleteReview: (id) => {
        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== id),
        }))
      },

      // Get reviews by barber ID
      getReviewsByBarber: (barberId) => {
        const { reviews } = get()
        return reviews.filter((review) => review.barberId === barberId)
      },

      // Get average rating for a barber
      getBarberRating: (barberId) => {
        const { reviews } = get()
        const barberReviews = reviews.filter((review) => review.barberId === barberId)
        if (barberReviews.length === 0) return 0
        const totalRating = barberReviews.reduce((sum, review) => sum + review.rating, 0)
        return Math.round((totalRating / barberReviews.length) * 10) / 10
      },

      // Get total reviews for a barber
      getBarberReviewCount: (barberId) => {
        const { reviews } = get()
        return reviews.filter((review) => review.barberId === barberId).length
      },

      // Check if booking already has a review
      hasReviewForBooking: (bookingId) => {
        const { reviews } = get()
        return reviews.some((review) => review.bookingId === bookingId)
      },
    }),
    {
      name: 'outlook-reviews',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Notification Store
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'booking',
    title: 'Booking Baru',
    message: 'Andi Pratama membuat booking untuk Classic Haircut',
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    isRead: false,
    link: '/admin/bookings',
  },
  {
    id: 2,
    type: 'review',
    title: 'Review Baru',
    message: 'Budi Santoso memberikan rating 5 bintang untuk Ahmad Rizky',
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isRead: false,
    link: '/admin/team',
  },
  {
    id: 3,
    type: 'booking',
    title: 'Booking Dikonfirmasi',
    message: 'Booking #1001 telah dikonfirmasi',
    time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    isRead: true,
    link: '/admin/bookings',
  },
  {
    id: 4,
    type: 'payment',
    title: 'Pembayaran Diterima',
    message: 'Pembayaran untuk booking #1002 telah diterima',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: true,
    link: '/admin/bookings',
  },
]

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,

      // Add new notification
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now(),
          time: new Date().toISOString(),
          isRead: false,
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
      },

      // Mark single notification as read
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          ),
        }))
      },

      // Mark all notifications as read
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
          })),
        }))
      },

      // Delete notification
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        }))
      },

      // Clear all notifications
      clearAll: () => {
        set({ notifications: [] })
      },

      // Get unread count
      getUnreadCount: () => {
        const { notifications } = get()
        return notifications.filter((notif) => !notif.isRead).length
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter((notif) => !notif.isRead)
      },
    }),
    {
      name: 'outlook-notifications',
      storage: createJSONStorage(() => localStorage),
    }
  )
)