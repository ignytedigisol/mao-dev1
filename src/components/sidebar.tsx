"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { ShoppingCart, Layers, DollarSign, X } from "lucide-react"
import { brandConfig } from "@/config/brand"
import { useEffect, useState } from "react"
import Link from "next/link"

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  navItems?: NavItem[];
}

export function Sidebar({
  className,
  isMobileOpen = false,
  onCloseMobile,
  // Default nav items if not provided
  navItems = [
    { label: "Purchase", path: "/admin/purchase", icon: ShoppingCart },
    { label: "Inventory", path: "/admin/inventory", icon: Layers },
    { label: "Sales", path: "/admin/sales", icon: DollarSign }
  ]
}: SidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Set mounted to true after initial render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <>
      <aside
        className={cn(
          "fixed md:static w-[240px] md:w-16 bg-slate-900 text-white flex flex-col items-center py-4 h-full z-30 transition-all duration-300 transform shadow-md",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex items-center justify-between w-full px-4 md:px-2 mb-6">
          <div className="flex items-center">
            {/* Only render the actual logo when mounted (client-side) */}
            {mounted ? (
              <div
                className="h-8 w-8 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${brandConfig.logoUrl})` }}
                aria-label={`${brandConfig.name} Logo`}
              />
            ) : (
              <div className="h-8 w-8" style={{ backgroundColor: "#1E293B" }} />
            )}
            <span className="ml-3 font-semibold text-white md:hidden">
              {brandConfig.name}
            </span>
          </div>
          <button
            className="md:hidden text-white hover:bg-slate-700 p-1.5 rounded"
            onClick={onCloseMobile}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col w-full">
          <nav className="space-y-1 w-full">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  href={item.path}
                  key={item.path}
                  className={cn(
                    "flex items-center px-4 md:justify-center py-3 transition-colors",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                  title={item.label}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="ml-3 md:hidden">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onCloseMobile}
        />
      )}
    </>
  )
}
