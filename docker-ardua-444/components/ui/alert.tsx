'use client'

import * as React from 'react'
import { cn } from '@/components/lib/utils'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'success'
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <div
                ref={ref}
                role="alert"
                className={cn(
                    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
                    {
                        'bg-background text-foreground': variant === 'default',
                        'border-destructive/50 text-destructive bg-destructive/10': variant === 'destructive',
                        'border-green-500/50 text-green-700 bg-green-50': variant === 'success',
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Alert.displayName = 'Alert'

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('text-sm [&_p]:leading-relaxed', className)}
                {...props}
            />
        )
    }
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }