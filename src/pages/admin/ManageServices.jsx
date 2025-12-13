import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  ToggleLeft,
  ToggleRight,
  Filter,
  Scissors,
} from 'lucide-react'
import { Card, CardContent } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { Input, Textarea, FormField } from '../../components/common/Input'
import { Modal, DialogFooter } from '../../components/common/Modal'
import { Badge } from '../../components/common/Badge'
import { serviceSchema } from '../../utils/validators'
import { formatCurrency, formatDuration } from '../../utils/formatters'
import { SERVICE_CATEGORIES } from '../../utils/constants'
import { useServicesStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

const ManageServices = () => {
  // Use Zustand store for persistence
  const { services, addService, updateService, deleteService, toggleActive } = useServicesStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
  })

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Open modal for add/edit
  const openModal = (service = null) => {
    if (service) {
      setEditingService(service)
      reset({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        isActive: service.isActive,
      })
    } else {
      setEditingService(null)
      reset({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
    reset()
  }

  // Submit form
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const serviceData = {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category: data.category,
        isActive: editingService?.isActive ?? true,
        image: editingService?.image || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop',
      }

      if (editingService) {
        updateService(editingService.id, serviceData)
        toast.success('Layanan berhasil diupdate')
      } else {
        addService(serviceData)
        toast.success('Layanan berhasil ditambahkan')
      }
      
      closeModal()
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle toggle active
  const handleToggleActive = (id) => {
    toggleActive(id)
    toast.success('Status berhasil diubah')
  }

  // Handle delete service
  const handleDelete = async () => {
    if (!deleteConfirm) return
    
    deleteService(deleteConfirm.id)
    toast.success('Layanan berhasil dihapus')
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-cream">Kelola Layanan</h1>
          <p className="text-cream/60 text-sm sm:text-base">Kelola daftar layanan barbershop</p>
        </div>
        <Button onClick={() => openModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search & Filter Toggle */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cream/40" />
                <Input
                  type="text"
                  placeholder="Cari layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm"
                />
              </div>
              <Button
                variant="outline"
                className="sm:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Category Filter - Scrollable on mobile */}
            <div className={cn(
              'overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0',
              showFilters ? 'block' : 'hidden sm:block'
            )}>
              <div className="flex gap-2 pb-1 sm:pb-0 sm:flex-wrap">
                {SERVICE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0',
                      selectedCategory === category.id
                        ? 'bg-gold text-charcoal-dark'
                        : 'bg-charcoal-dark border border-gold/30 text-cream/70 hover:border-gold'
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardContent className="p-0">
          {filteredServices.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <Scissors className="w-12 h-12 sm:w-16 sm:h-16 text-cream/20 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-cream mb-2">Tidak Ada Layanan</h3>
              <p className="text-cream/50 text-sm">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Tidak ada layanan yang sesuai dengan filter'
                  : 'Belum ada layanan. Tambahkan layanan baru.'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-gold/10">
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'p-4',
                      !service.isActive && 'opacity-60'
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-cream font-medium text-sm truncate">{service.name}</h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {SERVICE_CATEGORIES.find(c => c.id === service.category)?.label}
                        </Badge>
                      </div>
                      <span className="text-gold font-display text-sm ml-2">{formatCurrency(service.price)}</span>
                    </div>
                    
                    <p className="text-cream/50 text-xs line-clamp-2 mb-3">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-cream/70 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(service.duration)}
                        </div>
                        <button
                          onClick={() => handleToggleActive(service.id)}
                          className="flex items-center gap-1"
                        >
                          {service.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-cream/30" />
                          )}
                          <span className={cn(
                            'text-xs',
                            service.isActive ? 'text-green-500' : 'text-cream/50'
                          )}>
                            {service.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal(service)}
                          className="p-2 text-cream/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(service)}
                          className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold/20">
                      <th className="text-left py-4 px-4 lg:px-6 text-cream/60 font-medium text-sm">Nama Layanan</th>
                      <th className="text-left py-4 px-4 lg:px-6 text-cream/60 font-medium text-sm hidden lg:table-cell">Kategori</th>
                      <th className="text-left py-4 px-4 lg:px-6 text-cream/60 font-medium text-sm">Durasi</th>
                      <th className="text-left py-4 px-4 lg:px-6 text-cream/60 font-medium text-sm">Harga</th>
                      <th className="text-left py-4 px-4 lg:px-6 text-cream/60 font-medium text-sm">Status</th>
                      <th className="text-left py-4 px-4 lg:px-6 text-cream/60 font-medium text-sm">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service) => (
                      <motion.tr
                        key={service.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          'border-b border-gold/10 hover:bg-gold/5 transition-colors',
                          !service.isActive && 'opacity-60'
                        )}
                      >
                        <td className="py-4 px-4 lg:px-6">
                          <div>
                            <h3 className="text-cream font-medium text-sm">{service.name}</h3>
                            <p className="text-cream/50 text-xs line-clamp-1 max-w-[200px] lg:max-w-[300px]">
                              {service.description}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs lg:hidden">
                              {SERVICE_CATEGORIES.find(c => c.id === service.category)?.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6 hidden lg:table-cell">
                          <Badge variant="outline">
                            {SERVICE_CATEGORIES.find(c => c.id === service.category)?.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center gap-1 text-cream/70 text-sm">
                            <Clock className="w-4 h-4" />
                            {formatDuration(service.duration)}
                          </div>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <span className="text-gold font-display text-sm">{formatCurrency(service.price)}</span>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <button
                            onClick={() => handleToggleActive(service.id)}
                            className="flex items-center gap-2"
                          >
                            {service.isActive ? (
                              <ToggleRight className="w-6 h-6 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-cream/30" />
                            )}
                            <span className={cn(
                              'text-xs',
                              service.isActive ? 'text-green-500' : 'text-cream/50'
                            )}>
                              {service.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </button>
                        </td>
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openModal(service)}
                              className="p-2 text-cream/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(service)}
                              className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingService ? 'Edit Layanan' : 'Tambah Layanan'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <FormField label="Nama Layanan" error={errors.name?.message} required>
            <Input
              {...register('name')}
              placeholder="Contoh: Classic Haircut"
              error={errors.name}
              className="text-sm"
            />
          </FormField>

          <FormField label="Deskripsi" error={errors.description?.message} required>
            <Textarea
              {...register('description')}
              placeholder="Deskripsi singkat layanan..."
              rows={3}
              error={errors.description}
              className="text-sm"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Harga (Rp)" error={errors.price?.message} required>
              <Input
                {...register('price', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="75000"
                error={errors.price}
                className="text-sm"
              />
            </FormField>

            <FormField label="Durasi (menit)" error={errors.duration?.message} required>
              <Input
                {...register('duration', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="45"
                error={errors.duration}
                className="text-sm"
              />
            </FormField>
          </div>

          <FormField label="Kategori" error={errors.category?.message} required>
            <select
              {...register('category')}
              className={cn(
                "w-full px-4 py-3 bg-charcoal-dark border rounded-lg text-cream text-sm focus:outline-none transition-colors",
                errors.category ? "border-red-500 focus:border-red-500" : "border-gold/30 focus:border-gold"
              )}
            >
              <option value="">Pilih kategori</option>
              {SERVICE_CATEGORIES.filter(c => c.id !== 'all').map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </FormField>
        </form>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={closeModal} disabled={isSubmitting}>
            Batal
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {editingService ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Layanan"
      >
        <div className="py-4">
          <p className="text-cream/70 text-sm">
            Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          {deleteConfirm && (
            <div className="mt-4 p-3 sm:p-4 bg-charcoal-dark rounded-lg">
              <p className="text-gold font-medium text-sm">{deleteConfirm.name}</p>
              <p className="text-cream/60 text-xs">{formatCurrency(deleteConfirm.price)}</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Hapus
          </Button>
        </DialogFooter>
      </Modal>
    </div>
  )
}

export default ManageServices