import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  Award, 
  Clock, 
  Calendar,
  Instagram,
  X
} from 'lucide-react'
import Button from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { useTeamStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

const Team = () => {
  const [selectedBarber, setSelectedBarber] = useState(null)
  const { barbers } = useTeamStore()

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="section-subtitle">Tim Kami</span>
            <h1 className="section-title mb-4">
              Barber <span className="text-gradient">Profesional</span>
            </h1>
            <p className="text-cream/60">
              Kenali tim barber berpengalaman kami yang siap memberikan layanan terbaik untuk Anda
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Barbers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber, index) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              index={index}
              onViewProfile={() => setSelectedBarber(barber)}
            />
          ))}
        </div>
      </div>

      {/* Barber Profile Modal */}
      <AnimatePresence>
        {selectedBarber && (
          <BarberProfileModal
            barber={selectedBarber}
            onClose={() => setSelectedBarber(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Barber Card Component
const BarberCard = ({ barber, index, onViewProfile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className="relative rounded-lg overflow-hidden bg-charcoal border border-gold/20 card-hover">
        {/* Image */}
        <div className="aspect-[4/5] relative overflow-hidden">
          <img
            src={barber.image}
            alt={barber.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />

          {/* Availability Badge */}
          <div className={cn(
            'absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium',
            barber.isAvailable
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          )}>
            {barber.isAvailable ? 'Available' : 'Not Available'}
          </div>

          {/* Quick Stats on Hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gold">
                <Star className="w-4 h-4 fill-gold" />
                <span>{barber.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-cream/70">
                <Clock className="w-4 h-4" />
                <span>{barber.experience} tahun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-heading text-xl font-bold text-cream mb-1">
            {barber.name}
          </h3>
          <p className="text-gold text-sm mb-3">{barber.role}</p>

          {/* Specializations */}
          <div className="flex flex-wrap gap-2 mb-4">
            {barber.specializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="px-2 py-1 bg-gold/10 text-gold/80 text-xs rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onViewProfile}
            >
              Lihat Profil
            </Button>
            <Link to={`/booking?barber=${barber.id}`} className="flex-1">
              <Button size="sm" className="w-full" disabled={!barber.isAvailable}>
                <Calendar className="w-4 h-4 mr-1" />
                Book
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Barber Profile Modal
const BarberProfileModal = ({ barber, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal-dark/95 backdrop-blur-md" />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative max-w-3xl w-full bg-charcoal border border-gold/20 rounded-lg overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-charcoal-dark/80 flex items-center justify-center text-cream hover:text-gold transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-2/5 aspect-[4/5] md:aspect-auto">
            <img
              src={barber.image}
              alt={barber.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="md:w-3/5 p-6 md:p-8">
            {/* Header */}
            <div className="mb-6">
              <span className={cn(
                'inline-block px-3 py-1 rounded-full text-xs font-medium mb-3',
                barber.isAvailable
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              )}>
                {barber.isAvailable ? 'Available Today' : 'Not Available'}
              </span>
              <h2 className="font-heading text-3xl font-bold text-cream mb-1">
                {barber.name}
              </h2>
              <p className="text-gold">{barber.role}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-charcoal-dark rounded-lg">
                <div className="flex items-center justify-center gap-1 text-gold mb-1">
                  <Star className="w-4 h-4 fill-gold" />
                  <span className="font-display text-xl">{barber.rating}</span>
                </div>
                <span className="text-cream/50 text-xs">Rating</span>
              </div>
              <div className="text-center p-3 bg-charcoal-dark rounded-lg">
                <div className="flex items-center justify-center gap-1 text-gold mb-1">
                  <Award className="w-4 h-4" />
                  <span className="font-display text-xl">{barber.experience}</span>
                </div>
                <span className="text-cream/50 text-xs">Tahun</span>
              </div>
              <div className="text-center p-3 bg-charcoal-dark rounded-lg">
                <span className="font-display text-xl text-gold block mb-1">
                  {barber.totalClients.toLocaleString()}
                </span>
                <span className="text-cream/50 text-xs">Klien</span>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-cream font-medium mb-2">Tentang</h3>
              <p className="text-cream/60 text-sm leading-relaxed">{barber.bio}</p>
            </div>

            {/* Specializations */}
            <div className="mb-6">
              <h3 className="text-cream font-medium mb-2">Keahlian</h3>
              <div className="flex flex-wrap gap-2">
                {barber.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1.5 bg-gold/10 text-gold text-sm rounded-full border border-gold/30"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Instagram */}
            <div className="mb-6">
              <a
                href={`https://instagram.com/${barber.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cream/60 hover:text-gold transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm">{barber.instagram}</span>
              </a>
            </div>

            {/* Book Button */}
            <Link to={`/booking?barber=${barber.id}`}>
              <Button className="w-full" size="lg" disabled={!barber.isAvailable}>
                <Calendar className="w-4 h-4 mr-2" />
                {barber.isAvailable ? 'Book Appointment' : 'Tidak Tersedia'}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Team