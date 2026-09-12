import type * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeProps = React.ComponentProps<'span'> & {
  variant?: 'default' | 'outline' | 'accent' | 'muted'
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'border-transparent bg-primary/10 text-primary',
  accent: 'border-transparent bg-accent/15 text-accent-foreground',
  muted: 'border-transparent bg-muted text-muted-foreground',
  outline: 'border-border text-foreground',
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-relaxed',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
