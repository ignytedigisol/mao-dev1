"use client"

import * as React from "react"
import { Sidebar } from "@/components/sidebar"
import { useState, createContext, useContext } from "react"
import { ShoppingCart, Layers, DollarSign } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Create a context for mobile menu state
interface MobileMenuContextType {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {}
})

// Custom hook to use the mobile menu context - internal use only
const useMobileMenuInternal = () => useContext(MobileMenuContext)

// Navigation items shared between sidebar and mobile bottom nav
const navItems = [
  {
    label: "Purchase",
    path: "/admin/purchase",
    icon: ShoppingCart
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: Layers
  },
  {
    label: "Sales",
    path: "/admin/sales",
    icon: DollarSign
  }
]

// Mobile bottom navigation component
function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 shadow-lg border-t border-slate-800 z-40 md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <Link
              href={item.path}
              key={item.path}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center transition-colors",
                  isActive ? "text-blue-400" : "text-slate-300"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Since we can't expose the context through a hook externally,
  // we'll inject it as props to our children components
  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, toggleMobileMenu, closeMobileMenu }}>
      <div className="flex h-screen bg-white relative overflow-hidden">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={closeMobileMenu}
          navItems={navItems}
        />
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          {/* Clone children to pass mobile menu props */}
          <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
            {React.isValidElement(children) ?
              React.cloneElement(children, {
                toggleMobileMenu,
                isMobileMenuOpen
              }) :
              children
            }
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </MobileMenuContext.Provider>
  )
}

// Export the hook for client components
export const useMobileMenu = useMobileMenuInternal
