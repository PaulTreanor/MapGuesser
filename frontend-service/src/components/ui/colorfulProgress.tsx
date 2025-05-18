/**
 * An enhanced version of the shadcn Progress component with the following additional features:
 * 
 * - Custom color support: Specify any valid CSS color for both the indicator and background
 * - Pulse effect: Optional glowing animation that creates a gradient fade below the progress bar
 */

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ColorfulProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  color?: string
  backgroundColor?: string
  pulse?: boolean
  style?: React.CSSProperties
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ColorfulProgressProps
>(({ className, value, color, backgroundColor, pulse = false, style, ...props }, ref) => {
  // Default colors
  const indicatorColor = color || 'var(--primary)'
  const bgColor = backgroundColor || 'var(--primary-light)'
  
  return (
    <div className="relative">
      {pulse && (
        <div className="absolute w-full top-0 left-0 overflow-visible" style={{ height: '16px' }}>
          {/* Smooth gradient glow */}
          <div 
            /* breathe animation defined in tailwind.config.js */
            className="absolute w-full top-0 left-0 rounded-b-3xl animate-breathe"
            style={{ 
              height: '30px',
              background: `linear-gradient(to bottom, ${indicatorColor} 0%, ${indicatorColor}00 100%)`,
              opacity: 0.7,
              filter: 'blur(10px)',
              transition: 'background 0.3s ease'
            }}
          />
        </div>
      )}
      
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden",
          pulse ? "z-10" : "",
          className
        )}
        style={{ 
          backgroundColor: `${bgColor}33`, // Apply 20% opacity to background
          transition: 'background-color 0.3s ease',
          ...style
        }}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 transition-all"
          style={{ 
            transform: `translateX(-${100 - (value || 0)}%)`,
            backgroundColor: indicatorColor,
            boxShadow: pulse ? `0 0 8px 2px ${indicatorColor}` : 'none',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }