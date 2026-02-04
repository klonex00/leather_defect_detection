import type React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-black/25 hover:bg-white/10 transition-all duration-300",
        className,
      )}
    >
      {children}
    </div>
  )
}
