import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),

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
    }),
    {
      name: 'outlook-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
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