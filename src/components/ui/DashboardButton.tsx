'use client'

import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import Link from 'next/link'

type DashboardButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
type DashboardButtonSize = 'sm' | 'md'

interface DashboardButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: DashboardButtonVariant
  size?: DashboardButtonSize
  fullWidth?: boolean
  href?: string
  target?: string
  rel?: string
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function DashboardButton({
  children,
  variant = 'secondary',
  size = 'sm',
  fullWidth = false,
  className,
  disabled,
  href,
  target,
  rel,
  onClick,
  ...props
}: DashboardButtonProps) {
  const baseClass = cx(
    'db-btn',
    `db-btn--${variant}`,
    size === 'md' ? 'db-btn--md' : 'db-btn--sm',
    fullWidth && 'db-btn--full',
    disabled && 'db-btn--disabled',
    className
  )

  if (href) {
    const handleLinkClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      ;(onClick as MouseEventHandler<HTMLAnchorElement> | undefined)?.(e)
    }

    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={baseClass}
        aria-disabled={disabled ? true : undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={handleLinkClick}
      >
        {children}
      </Link>
    )
  }

  return (
    <button className={baseClass} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
