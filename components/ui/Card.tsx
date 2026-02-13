import { HTMLAttributes, ReactNode } from 'react'

type CardVariant = 'default' | 'elevated' | 'interactive'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  title?: string
  description?: string
  children?: ReactNode
  className?: string
}

const variantClasses: Record<CardVariant, string> = {
  default: 'shadow-[var(--shadow-card)]',
  elevated: 'shadow-[var(--shadow-elevated)]',
  interactive:
    'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer',
}

export default function Card({
  variant = 'default',
  title,
  description,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'bg-white border border-gray-200 rounded-xl p-6',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-semibold text-gray-900 text-base leading-snug">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
