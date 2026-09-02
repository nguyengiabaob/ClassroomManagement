import type * as React from "react"

import { cn } from "@/lib/utils"

function Progress({ className, value = 0, indicatorClassName, ...props }: React.ComponentProps<"div"> & { value?: number; indicatorClassName?: string }) {
  const normalizedValue = Math.min(100, Math.max(0, value))

  return (
    <div data-slot="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalizedValue} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)} {...props}>
      <div data-slot="progress-indicator" className={cn("h-full rounded-full bg-slate-900 transition-all", indicatorClassName)} style={{ width: `${normalizedValue}%` }} />
    </div>
  )
}

export { Progress }
