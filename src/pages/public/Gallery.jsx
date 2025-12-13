import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, Play } from 'lucide-react'
import { GALLERY_CATEGORIES } from '../../utils/constants'
import { cn } from '../../lib/utils'

// Dummy gallery data
const GALLERY_DATA = [
  {
    id: 1,
    category: 'before-after',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=800&fit=crop',
    title: 'Classic Transformation',
    type: 'image',
  },
  {
    id: 2,
    category: 'before-after',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop',
    title: 'Fade Makeover',
    type: 'image',
  },
  {
    id: 3,
    category: 'ambience',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop',
    title: 'Interior View',
    type: 'image',
  },
  {
    id: 4,
    category: 'ambience',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=800&fit=crop',
    title: 'Barber Station',
    type: 'image',
  },
  {
    id: 5,
    category: 'tools',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop',
    title: 'Premium Tools',
    type: 'image',
  },
  {
    id: 6,
    category: 'tools',
    image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&h=600&fit=crop',
    title: 'Shaving Kit',
    type: 'image',
  },
  {
    id: 7,
    category: 'before-after',
    image: 'https://images.unsplash.com/photo-1560869713-bf0cd31a2478?w=600&h=800&fit=crop',
    title: 'Styling Result',
    type: 'image',
  },
  {
    id: 8,
    category: 'ambience',
    image: 'https://images.unsplash.com/photo-1521490683712-35a1cb235d1c?w=800&h=600&fit=crop',
    title: 'Waiting Area',
    type: 'image',
  },
  {
    id: 9,
    category: 'awards',
    image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=600&h=600&fit=crop',
    title: 'Best Barbershop 2023',
    type: 'image',
  },
  {
    id: 10,
    category: 'before-after',
    image: 'https://images.unsplash.com/photo-1593702288056-7927b442d0fa?w=600&h=800&fit=crop',
    title: 'Beard Transformation',
    type: 'image',
  },
  {
    id: 11,
    category: 'tools',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop',
    title: 'Classic Razor',
    type: 'image',
  },
  {
    id: 12,
    category: 'ambience',
    image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=800&h=600&fit=crop',
    title: 'Evening Vibes',
    type: 'image',
  },
]

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)

  // Filter gallery items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return GALLERY_DATA
    return GALLERY_DATA.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

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
            <span className="section-subtitle">Galeri Kami</span>
            <h1 className="section-title mb-4">
              Portfolio <span className="text-gradient">Karya</span>
            </h1>
            <p className="text-cream/60">
              Lihat hasil kerja tim barber profesional kami dan suasana Outlook Barbershop
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {GALLERY_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-all duration-300',
                selectedCategory === category.id
                  ? 'bg-gold text-charcoal-dark'
                  : 'bg-charcoal border border-gold/30 text-cream/70 hover:border-gold hover:text-gold'
              )}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid - Masonry Style */}
        <motion.div
          layout
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <GalleryItem
                key={item.id}
                item={item}
                index={index}
                onClick={() => setSelectedImage(item)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <Lightbox
              image={selectedImage}
              onClose={() => setSelectedImage(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Gallery Item Component
const GalleryItem = ({ item, index, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative rounded-lg overflow-hidden bg-charcoal">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-charcoal-dark/0 group-hover:bg-charcoal-dark/60 transition-colors duration-300 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {item.type === 'video' ? (
              <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center">
                <Play className="w-6 h-6 text-charcoal-dark ml-1" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gold/20 backdrop-blur-sm flex items-center justify-center border border-gold/50">
                <ZoomIn className="w-5 h-5 text-gold" />
              </div>
            )}
          </motion.div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-charcoal-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-cream font-medium text-sm">{item.title}</h3>
          <p className="text-gold/70 text-xs capitalize">
            {GALLERY_CATEGORIES.find(c => c.id === item.category)?.label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Lightbox Component
const Lightbox = ({ image, onClose }) => {
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

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-charcoal border border-gold/30 flex items-center justify-center text-cream hover:text-gold hover:border-gold transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative max-w-5xl max-h-[85vh] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.image}
          alt={image.title}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
        
        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-charcoal-dark to-transparent rounded-b-lg">
          <h3 className="text-cream font-heading text-xl font-bold">{image.title}</h3>
          <p className="text-gold/70 text-sm capitalize">
            {GALLERY_CATEGORIES.find(c => c.id === image.category)?.label}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Gallery
