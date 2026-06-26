import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
}

export function Spinner({ message = "Loading...", className, ...props }: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-[50vh] space-y-4", className)} {...props}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-md bg-primary/30 animate-pulse"></div>
        <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
      </div>
      {message && <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>}
    </div>
  )
}
