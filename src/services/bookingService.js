import api from './api'

export const bookingService = {
  // Get all bookings (user's own or all for admin)
  getBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params })
    return response.data
  },

  // Get single booking
  getBooking: async (id) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData)
    return response.data
  },

  // Update booking status (admin)
  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, { status })
    return response.data
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`)
    return response.data
  },

  // Get available time slots
  getAvailableSlots: async (barberId, date) => {
    const response = await api.get(`/barbers/${barberId}/availability`, {
      params: { date },
    })
    return response.data
  },
}

export const servicesService = {
  // Get all services
  getServices: async (params = {}) => {
    const response = await api.get('/services', { params })
    return response.data
  },

  // Get single service
  getService: async (id) => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },

  // Create service (admin)
  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData)
    return response.data
  },

  // Update service (admin)
  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData)
    return response.data
  },

  // Delete service (admin)
  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`)
    return response.data
  },
}

export const barbersService = {
  // Get all barbers
  getBarbers: async (params = {}) => {
    const response = await api.get('/barbers', { params })
    return response.data
  },

  // Get single barber
  getBarber: async (id) => {
    const response = await api.get(`/barbers/${id}`)
    return response.data
  },

  // Get barber availability
  getBarberAvailability: async (id, date) => {
    const response = await api.get(`/barbers/${id}/availability`, {
      params: { date },
    })
    return response.data
  },

  // Create barber (admin)
  createBarber: async (barberData) => {
    const response = await api.post('/barbers', barberData)
    return response.data
  },

  // Update barber (admin)
  updateBarber: async (id, barberData) => {
    const response = await api.put(`/barbers/${id}`, barberData)
    return response.data
  },

  // Delete barber (admin)
  deleteBarber: async (id) => {
    const response = await api.delete(`/barbers/${id}`)
    return response.data
  },
}

export const galleryService = {
  // Get all gallery items
  getGalleryItems: async (params = {}) => {
    const response = await api.get('/gallery', { params })
    return response.data
  },

  // Create gallery item (admin)
  createGalleryItem: async (itemData) => {
    const response = await api.post('/gallery', itemData)
    return response.data
  },

  // Delete gallery item (admin)
  deleteGalleryItem: async (id) => {
    const response = await api.delete(`/gallery/${id}`)
    return response.data
  },
}

export default {
  booking: bookingService,
  services: servicesService,
  barbers: barbersService,
  gallery: galleryService,
}
