"use client"

import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"

interface HeaderProps {
  title: string
  onClose?: () => void
  onMenuToggle?: () => void
}

export function Header({ title, onClose, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between px-3 md:px-4 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8 flex-shrink-0"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        <h1 className="text-base md:text-lg font-semibold text-white truncate">
          {title}
          <span className="ml-2 text-xs font-normal text-slate-400 hidden sm:inline-block">{brandConfig.name}</span>
        </h1>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8 flex-shrink-0"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </header>
  )
}
