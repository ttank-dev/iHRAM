'use client'

import { useState } from 'react'

/* ─────────────────────────────────────────────
   STATUS TOGGLE BUTTON — iHRAM Shared Component
   
   Usage examples:
   
   // Package publish/unpublish
   <StatusToggleButton
     status={pkg.status}
     type="package"
     onToggle={(newStatus) => handleChangeStatus(pkg.id, newStatus)}
   />
   
   // Agency active/inactive
   <StatusToggleButton
     status={agency.is_active ? 'active' : 'inactive'}
     type="agency"
     onToggle={(newStatus) => handleToggleAgency(agency.id, newStatus)}
   />
   
   // Guide published/draft
   <StatusToggleButton
     status={guide.is_published ? 'published' : 'draft'}
     type="guide"
     onToggle={(newStatus) => handleToggleGuide(guide.id, newStatus)}
   />
   
   // Review approved/pending
   <StatusToggleButton
     status={review.is_approved ? 'approved' : 'pending'}
     type="review"
     onToggle={(newStatus) => handleToggleReview(review.id, newStatus)}
   />
   
   // Agency verified/unverified
   <StatusToggleButton
     status={agency.is_verified ? 'verified' : 'unverified'}
     type="verified"
     onToggle={(newStatus) => handleVerify(agency.id, newStatus)}
   />
────────────────────────────────────────────── */

type PackageStatus = 'draft' | 'published' | 'archived'
type SimpleStatus = 'active' | 'inactive' | 'published' | 'draft' | 'approved' | 'pending' | 'verified' | 'unverified'
type AnyStatus = PackageStatus | SimpleStatus

type ButtonType = 'package' | 'agency' | 'guide' | 'review' | 'verified' | 'newsfeed' | 'reel'

interface StatusToggleButtonProps {
  status: AnyStatus
  type: ButtonType
  onToggle: (newStatus: string) => void | Promise<void>
  size?: 'sm' | 'md'
  showLabel?: boolean
  disabled?: boolean
}

// ── Config: what each status looks like and what it toggles to ──
const CONFIG: Record<string, {
  label: string
  icon: string
  bg: string
  color: string
  toggleTo: string
  toggleLabel: string
  toggleIcon: string
  toggleBg: string
  toggleColor: string
}> = {
  // Package: 3-state (draft → published → archived)
  draft: {
    label: 'Draft', icon: '📝', bg: '#F5F5F0', color: '#888',
    toggleTo: 'published', toggleLabel: 'Publish', toggleIcon: '✓', toggleBg: '#10B981', toggleColor: 'white'
  },
  published: {
    label: 'Published', icon: '✅', bg: '#ECFDF5', color: '#10B981',
    toggleTo: 'draft', toggleLabel: 'Unpublish', toggleIcon: '⏸', toggleBg: '#F59E0B', toggleColor: 'white'
  },
  archived: {
    label: 'Archived', icon: '🗄️', bg: '#FEF3C7', color: '#F59E0B',
    toggleTo: 'published', toggleLabel: 'Unarchive', toggleIcon: '↩️', toggleBg: '#10B981', toggleColor: 'white'
  },
  // Agency/content: 2-state
  active: {
    label: 'Active', icon: '✅', bg: '#ECFDF5', color: '#10B981',
    toggleTo: 'inactive', toggleLabel: 'Deactivate', toggleIcon: '⏸', toggleBg: '#EF4444', toggleColor: 'white'
  },
  inactive: {
    label: 'Inactive', icon: '⛔', bg: '#FEE2E2', color: '#EF4444',
    toggleTo: 'active', toggleLabel: 'Activate', toggleIcon: '✓', toggleBg: '#10B981', toggleColor: 'white'
  },
  // Review
  approved: {
    label: 'Approved', icon: '✅', bg: '#ECFDF5', color: '#10B981',
    toggleTo: 'pending', toggleLabel: 'Revoke', toggleIcon: '↩', toggleBg: '#F59E0B', toggleColor: 'white'
  },
  pending: {
    label: 'Pending', icon: '⏳', bg: '#FEF3C7', color: '#F59E0B',
    toggleTo: 'approved', toggleLabel: 'Approve', toggleIcon: '✓', toggleBg: '#10B981', toggleColor: 'white'
  },
  // Verification
  verified: {
    label: 'Verified', icon: '🏅', bg: '#EFF6FF', color: '#3B82F6',
    toggleTo: 'unverified', toggleLabel: 'Unverify', toggleIcon: '✕', toggleBg: '#EF4444', toggleColor: 'white'
  },
  unverified: {
    label: 'Unverified', icon: '❓', bg: '#F5F5F0', color: '#888',
    toggleTo: 'verified', toggleLabel: 'Verify', toggleIcon: '🏅', toggleBg: '#3B82F6', toggleColor: 'white'
  },
}

export default function StatusToggleButton({
  status,
  type,
  onToggle,
  size = 'sm',
  showLabel = false,
  disabled = false,
}: StatusToggleButtonProps) {
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)

  const cfg = CONFIG[status]
  if (!cfg) return null

  const pad = size === 'md' ? '8px 16px' : '6px 12px'
  const fontSize = size === 'md' ? '13px' : '12px'

  const handleClick = async () => {
    if (loading || disabled) return
    setLoading(true)
    try {
      await onToggle(cfg.toggleTo)
    } finally {
      setLoading(false)
    }
  }

  // Hovering shows the action button, not hovering shows the current status badge
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {/* Current status badge */}
      {showLabel && (
        <span style={{
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          background: cfg.bg,
          color: cfg.color,
          whiteSpace: 'nowrap',
        }}>
          {cfg.icon} {cfg.label}
        </span>
      )}

      {/* Toggle action button */}
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title={`${cfg.toggleLabel} → ${cfg.toggleTo}`}
        style={{
          padding: pad,
          backgroundColor: loading ? '#ccc' : (hover ? darken(cfg.toggleBg) : cfg.toggleBg),
          color: cfg.toggleColor,
          border: 'none',
          borderRadius: '6px',
          fontSize,
          fontWeight: '600',
          cursor: loading || disabled ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'background 0.15s',
          whiteSpace: 'nowrap',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {loading ? (
          <span style={{ display: 'inline-block', animation: 'stb-spin 0.6s linear infinite' }}>⟳</span>
        ) : (
          <span>{cfg.toggleIcon}</span>
        )}
        {size === 'md' && <span>{loading ? '...' : cfg.toggleLabel}</span>}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes stb-spin { to { transform: rotate(360deg); } }
      `}} />
    </div>
  )
}

// ── Status Badge only (no button) ──
export function StatusBadge({ status }: { status: AnyStatus }) {
  const cfg = CONFIG[status]
  if (!cfg) return null
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      background: cfg.bg,
      color: cfg.color,
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ── Action Button (Cancel, Edit, View, etc.) ──
interface ActionButtonProps {
  action: 'cancel' | 'edit' | 'view' | 'duplicate' | 'archive' | 'restore'
  onClick: () => void | Promise<void>
  size?: 'sm' | 'md'
  disabled?: boolean
}

const ACTION_CONFIG: Record<string, {
  label: string
  icon: string
  bg: string
  color: string
  hoverBg: string
  border?: string
}> = {
  cancel:    { label: 'Cancel',    icon: '✕',  bg: 'transparent', color: '#888',    hoverBg: '#F5F5F0', border: '1px solid #E5E5E0' },
  edit:      { label: 'Edit',      icon: '✏️', bg: '#EFF6FF',     color: '#3B82F6', hoverBg: '#DBEAFE' },
  view:      { label: 'View',      icon: '👁️', bg: '#F5F5F0',     color: '#555',    hoverBg: '#E8E8E4' },
  duplicate: { label: 'Duplicate', icon: '⧉',  bg: '#F5F5F0',     color: '#555',    hoverBg: '#E8E8E4' },
  archive:   { label: 'Archive',   icon: '🗄️', bg: '#FEF3C7',     color: '#F59E0B', hoverBg: '#FDE68A' },
  restore:   { label: 'Restore',   icon: '↩️', bg: '#ECFDF5',     color: '#10B981', hoverBg: '#D1FAE5' },
}

export function ActionButton({ action, onClick, size = 'sm', disabled = false }: ActionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)
  const cfg = ACTION_CONFIG[action]
  if (!cfg) return null

  const pad = size === 'md' ? '8px 16px' : '6px 12px'
  const fontSize = size === 'md' ? '13px' : '12px'

  const handleClick = async () => {
    if (loading || disabled) return
    setLoading(true)
    try { await onClick() } finally { setLoading(false) }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={cfg.label}
      style={{
        padding: pad,
        backgroundColor: hover ? cfg.hoverBg : cfg.bg,
        color: cfg.color,
        border: cfg.border || 'none',
        borderRadius: '6px',
        fontSize,
        fontWeight: '600',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span>{loading ? '⟳' : cfg.icon}</span>
      {size === 'md' && <span>{loading ? '...' : cfg.label}</span>}
    </button>
  )
}

// ── Delete Button — always requires confirm dialog ──
interface DeleteButtonProps {
  onDelete: () => void | Promise<void>
  confirmMessage?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function DeleteButton({
  onDelete,
  confirmMessage = 'Are you sure you want to delete this? This action cannot be undone.',
  size = 'sm',
  disabled = false,
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)

  const pad = size === 'md' ? '8px 16px' : '6px 12px'
  const fontSize = size === 'md' ? '13px' : '12px'

  const handleClick = async () => {
    if (loading || disabled) return
    if (!confirm(confirmMessage)) return
    setLoading(true)
    try { await onDelete() } finally { setLoading(false) }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Delete"
      style={{
        padding: pad,
        backgroundColor: hover ? '#FEE2E2' : 'transparent',
        color: '#EF4444',
        border: '1px solid #FECACA',
        borderRadius: '6px',
        fontSize,
        fontWeight: '600',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span>{loading ? '⟳' : '🗑️'}</span>
      {size === 'md' && <span>{loading ? '...' : 'Delete'}</span>}
    </button>
  )
}

// Helper: darken hex on hover
function darken(hex: string): string {
  const map: Record<string, string> = {
    '#10B981': '#059669',
    '#F59E0B': '#D97706',
    '#EF4444': '#DC2626',
    '#3B82F6': '#2563EB',
    '#B8936D': '#9A7A5A',
  }
  return map[hex] || hex
}