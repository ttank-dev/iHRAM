'use client'

import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import Link from 'next/link'

type DashboardButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
type DashboardButtonSize = 'sm' | 'md'

interface DashboardButtonBaseProps {
  children: ReactNode
  variant?: DashboardButtonVariant
  size?: DashboardButtonSize
  fullWidth?: boolean
  className?: string
  disabled?: boolean
}

type DashboardButtonButtonProps = DashboardButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'disabled'> & {
    href?: undefined
  }

type DashboardButtonLinkProps = DashboardButtonBaseProps & {
  href: string
  target?: string
  rel?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

type DashboardButtonProps = DashboardButtonButtonProps | DashboardButtonLinkProps

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function isLinkProps(props: DashboardButtonProps): props is DashboardButtonLinkProps {
  return typeof (props as DashboardButtonLinkProps).href === 'string'
}

export default function DashboardButton(props: DashboardButtonProps) {
  const {
    children,
    variant = 'secondary',
    size = 'sm',
    fullWidth = false,
    className,
    disabled = false,
  } = props

  const baseClass = cx(
    'db-btn',
    `db-btn--${variant}`,
    size === 'md' ? 'db-btn--md' : 'db-btn--sm',
    fullWidth && 'db-btn--full',
    disabled && 'db-btn--disabled',
    className
  )

  if (isLinkProps(props)) {
    const { href, target, rel, onClick } = props
    const handleLinkClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      onClick?.(e)
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

  const {
    children: _children,
    variant: _variant,
    size: _size,
    fullWidth: _fullWidth,
    className: _className,
    href: _href,
    ...buttonProps
  } = props as DashboardButtonButtonProps

  return (
    <button className={baseClass} disabled={disabled} {...buttonProps}>
      {children}
    </button>
  )
}
