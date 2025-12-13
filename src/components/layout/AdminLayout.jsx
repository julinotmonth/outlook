import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react'
import Sidebar from './Sidebar'
import { useUIStore, useAuthStore } from '../../store/useStore'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  enter: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

const AdminLayout = () => {
  const location = useLocation()
  const { openSidebar } = useUIStore()
  const { user, logout } = useAuthStore()

  return (
    <div className="flex min-h-screen bg-charcoal-dark">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="sticky top-0 z-30 bg-charcoal/95 backdrop-blur-md border-b border-gold/20">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={openSidebar}
              className="lg:hidden p-2 text-cream hover:text-gold transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h1 className="font-heading text-xl font-bold text-cream">
                Admin Dashboard
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-cream/60 hover:text-gold transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                  <span className="hidden sm:block font-medium text-sm">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-charcoal border border-gold/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl">
                  <div className="px-4 py-2 border-b border-gold/20">
                    <p className="text-sm font-medium text-cream">{user?.name}</p>
                    <p className="text-xs text-cream/60">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-cream/70 hover:text-error hover:bg-error/10 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="enter"
              exit="exit"
              variants={pageVariants}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout