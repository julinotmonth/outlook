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
  Star,
  ToggleLeft,
  ToggleRight,
  Upload,
  Users,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { Input, Textarea, FormField } from '../../components/common/Input'
import { Modal, DialogFooter } from '../../components/common/Modal'
import { barberSchema } from '../../utils/validators'
import { useTeamStore } from '../../store/useStore'
import { TIME_SLOTS } from '../../utils/constants'
import { cn } from '../../lib/utils'

const ROLE_OPTIONS = [
  { value: 'Master Barber', label: 'Master Barber' },
  { value: 'Senior Barber', label: 'Senior Barber' },
  { value: 'Creative Barber', label: 'Creative Barber' },
  { value: 'Barber', label: 'Barber' },
  { value: 'Junior Barber', label: 'Junior Barber' },
]

const SPECIALIZATION_OPTIONS = [
  'Fade', 'Pompadour', 'Classic Cut', 'Beard Styling', 'Hot Towel Shave',
  'Skin Fade', 'Hair Design', 'Color', 'Modern Styles', 'Kids Haircut',
  'Basic Cut', 'Styling', 'Razor Work', 'Gentleman Cut', 'Undercut', 'Texture'
]

const ManageTeam = () => {
  // Use Zustand store for persistence
  const { barbers, addBarber, updateBarber, deleteBarber, toggleAvailability } = useTeamStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSpecializations, setSelectedSpecializations] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [workSchedule, setWorkSchedule] = useState({ startTime: '09:00', endTime: '20:00' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(barberSchema),
  })

  // Filter barbers
  const filteredBarbers = barbers.filter((barber) =>
    barber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barber.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Open modal
  const openModal = (barber = null) => {
    if (barber) {
      setEditingBarber(barber)
      setSelectedSpecializations(barber.specializations || [])
      setImageUrl(barber.image || '')
      setWorkSchedule(barber.workSchedule || { startTime: '09:00', endTime: '20:00' })
      reset({
        name: barber.name,
        role: barber.role,
        phone: barber.phone,
        experience: barber.experience,
        bio: barber.bio || '',
        instagram: barber.instagram || '',
      })
    } else {
      setEditingBarber(null)
      setSelectedSpecializations([])
      setImageUrl('')
      setWorkSchedule({ startTime: '09:00', endTime: '20:00' })
      reset({
        name: '',
        role: '',
        phone: '',
        experience: 0,
        bio: '',
        instagram: '',
      })
    }
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBarber(null)
    setSelectedSpecializations([])
    setImageUrl('')
    setWorkSchedule({ startTime: '09:00', endTime: '20:00' })
    reset()
  }

  // Toggle specialization
  const toggleSpecialization = (spec) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    )
  }

  // Submit form
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const barberData = {
        name: data.name,
        role: data.role,
        phone: data.phone,
        experience: data.experience,
        bio: data.bio || '',
        instagram: data.instagram || '',
        specializations: selectedSpecializations,
        rating: editingBarber?.rating || 0,
        totalClients: editingBarber?.totalClients || 0,
        image: imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        isAvailable: editingBarber?.isAvailable ?? true,
        workSchedule: workSchedule,
      }

      if (editingBarber) {
        updateBarber(editingBarber.id, barberData)
        toast.success('Barber berhasil diupdate')
      } else {
        addBarber(barberData)
        toast.success('Barber berhasil ditambahkan')
      }
      
      closeModal()
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle toggle availability
  const handleToggleAvailability = (id) => {
    toggleAvailability(id)
    toast.success('Status ketersediaan diubah')
  }

  // Handle delete barber
  const handleDelete = async () => {
    if (!deleteConfirm) return
    
    deleteBarber(deleteConfirm.id)
    toast.success('Barber berhasil dihapus')
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-cream">Kelola Tim</h1>
          <p className="text-cream/60 text-sm sm:text-base">Kelola data barber dan tim</p>
        </div>
        <Button onClick={() => openModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Barber
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cream/40" />
            <Input
              type="text"
              placeholder="Cari barber..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Barbers Grid */}
      {filteredBarbers.length === 0 ? (
        <Card>
          <CardContent className="py-12 sm:py-16 text-center">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-cream/20 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-cream mb-2">Tidak Ada Barber</h3>
            <p className="text-cream/50 text-sm">
              {searchQuery ? 'Tidak ada barber yang sesuai dengan pencarian' : 'Belum ada barber. Tambahkan barber baru.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBarbers.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                'hover:border-gold/40 transition-colors h-full',
                !barber.isAvailable && 'opacity-60'
              )}>
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={barber.image}
                      alt={barber.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gold/30 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-cream font-medium text-sm sm:text-base truncate">{barber.name}</h3>
                      <p className="text-gold text-xs sm:text-sm">{barber.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-gold fill-gold" />
                        <span className="text-cream/70 text-xs sm:text-sm">{barber.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Work Schedule */}
                  {barber.workSchedule && (
                    <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-charcoal-dark rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      <span className="text-cream/70 text-xs">
                        Jam Kerja: {barber.workSchedule.startTime} - {barber.workSchedule.endTime}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                    <div className="bg-charcoal-dark rounded-lg p-2">
                      <p className="text-gold font-display text-sm sm:text-lg">{barber.experience}th</p>
                      <p className="text-cream/50 text-xs">Pengalaman</p>
                    </div>
                    <div className="bg-charcoal-dark rounded-lg p-2">
                      <p className="text-gold font-display text-sm sm:text-lg">{barber.totalClients}</p>
                      <p className="text-cream/50 text-xs">Klien</p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {barber.specializations?.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                    {barber.specializations?.length > 3 && (
                      <span className="px-2 py-0.5 bg-charcoal-dark text-cream/50 text-xs rounded-full">
                        +{barber.specializations.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                    <button
                      onClick={() => handleToggleAvailability(barber.id)}
                      className="flex items-center gap-1"
                    >
                      {barber.isAvailable ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-cream/30" />
                      )}
                      <span className={cn(
                        'text-xs',
                        barber.isAvailable ? 'text-green-500' : 'text-cream/50'
                      )}>
                        {barber.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                      </span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(barber)}
                        className="p-1.5 text-cream/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(barber)}
                        className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBarber ? 'Edit Barber' : 'Tambah Barber'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Image Upload/URL */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-charcoal-dark border-2 border-dashed border-gold/30 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={cn(
                  "w-full h-full flex items-center justify-center",
                  imageUrl ? "hidden" : "flex"
                )}>
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-cream/30" />
                </div>
              </div>
            </div>
            <div className="w-full">
              <label className="block text-cream text-sm font-medium mb-1.5">URL Foto Profil</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="text-sm"
              />
              <p className="text-cream/40 text-xs mt-1">Masukkan URL gambar untuk foto profil barber</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nama" error={errors.name?.message} required>
              <Input
                {...register('name')}
                placeholder="Nama lengkap"
                error={errors.name}
                className="text-sm"
              />
            </FormField>

            <FormField label="Jabatan" error={errors.role?.message} required>
              <select
                {...register('role')}
                className={cn(
                  "w-full px-3 py-2.5 bg-charcoal-dark border rounded-lg text-cream text-sm focus:outline-none transition-colors",
                  errors.role ? "border-red-500 focus:border-red-500" : "border-gold/30 focus:border-gold"
                )}
              >
                <option value="">Pilih jabatan</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Telepon" error={errors.phone?.message} required>
              <Input
                {...register('phone')}
                placeholder="081234567890"
                error={errors.phone}
                className="text-sm"
              />
            </FormField>

            <FormField label="Pengalaman (tahun)" error={errors.experience?.message} required>
              <Input
                {...register('experience', { valueAsNumber: true })}
                type="number"
                min="0"
                max="50"
                placeholder="5"
                error={errors.experience}
                className="text-sm"
              />
            </FormField>
          </div>

          <FormField label="Bio" error={errors.bio?.message}>
            <Textarea
              {...register('bio')}
              placeholder="Deskripsi singkat tentang barber..."
              rows={2}
              error={errors.bio}
              className="text-sm"
            />
          </FormField>

          <FormField label="Instagram" error={errors.instagram?.message}>
            <Input
              {...register('instagram')}
              placeholder="@username"
              error={errors.instagram}
              className="text-sm"
            />
          </FormField>

          {/* Work Schedule */}
          <div>
            <label className="block text-cream text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              Jadwal Kerja
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-cream/60 text-xs mb-1">Jam Mulai</label>
                <select
                  value={workSchedule.startTime}
                  onChange={(e) => setWorkSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-charcoal-dark border border-gold/30 rounded-lg text-cream text-sm focus:outline-none focus:border-gold transition-colors"
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-cream/60 text-xs mb-1">Jam Selesai</label>
                <select
                  value={workSchedule.endTime}
                  onChange={(e) => setWorkSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-charcoal-dark border border-gold/30 rounded-lg text-cream text-sm focus:outline-none focus:border-gold transition-colors"
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-cream/40 text-xs mt-1">Atur jam kerja barber (jam buka - jam tutup)</p>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-cream text-sm font-medium mb-2">Spesialisasi</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={cn(
                    'px-2 py-1 rounded-full text-xs transition-colors',
                    selectedSpecializations.includes(spec)
                      ? 'bg-gold text-charcoal-dark'
                      : 'bg-charcoal-dark text-cream/70 hover:text-gold border border-gold/20'
                  )}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </form>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={closeModal} disabled={isSubmitting}>
            Batal
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {editingBarber ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Barber"
      >
        <div className="py-4">
          <p className="text-cream/70 text-sm">
            Apakah Anda yakin ingin menghapus barber ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          {deleteConfirm && (
            <div className="mt-4 p-3 sm:p-4 bg-charcoal-dark rounded-lg flex items-center gap-3">
              <img
                src={deleteConfirm.image}
                alt={deleteConfirm.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-cream font-medium text-sm">{deleteConfirm.name}</p>
                <p className="text-cream/60 text-xs">{deleteConfirm.role}</p>
              </div>
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

export default ManageTeam