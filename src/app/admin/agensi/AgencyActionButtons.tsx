'use client'

import { useState } from 'react'
import { verifyAgency, unverifyAgency, suspendAgency, activateAgency } from '../actions'
import { useRouter } from 'next/navigation'

interface AgencyActionButtonsProps {
  agencyId: string
  isVerified: boolean
  isActive: boolean
}

export default function AgencyActionButtons({
  agencyId,
  isVerified,
  isActive,
}: AgencyActionButtonsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleVerify() {
    console.log('🔵 handleVerify CALLED!')
    console.log('Agency ID:', agencyId)
    
    if (!confirm('Verify agensi ini?')) return
    setLoading(true)
    try {
      console.log('🟢 Calling verifyAgency...')
      const result = await verifyAgency(agencyId)
      console.log('🟢 Result:', result)
      if (result.success) {
        alert('Agensi berjaya di-verify!')
        router.refresh()
      }
    } catch (error: any) {
      console.error('🔴 Error:', error)
      alert('Gagal verify agensi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUnverify() {
    console.log('🔵 handleUnverify CALLED!')
    console.log('Agency ID:', agencyId)
    
    if (!confirm('Remove verified status dari agensi ini? (Contoh: license expired, ada complaints, etc)')) return
    setLoading(true)
    try {
      console.log('🟢 Calling unverifyAgency...')
      const result = await unverifyAgency(agencyId)
      console.log('🟢 Result:', result)
      if (result.success) {
        alert('Verified badge berjaya dibuang!')
        router.refresh()
      }
    } catch (error: any) {
      console.error('🔴 Error:', error)
      alert('Gagal unverify agensi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSuspend() {
    console.log('🔵 handleSuspend CALLED!')
    console.log('Agency ID:', agencyId)
    
    if (!confirm('Suspend agensi ini? Mereka tidak akan dapat login dan semua pakej akan hidden.')) return
    
    console.log('🟡 User confirmed, proceeding...')
    setLoading(true)
    
    try {
      console.log('🟢 Calling suspendAgency...')
      const result = await suspendAgency(agencyId)
      console.log('🟢 Result:', result)
      
      if (result.success) {
        alert('Agensi berjaya di-suspend!')
        router.refresh()
      }
    } catch (error: any) {
      console.error('🔴 Error:', error)
      alert('Gagal suspend agensi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleActivate() {
    console.log('🔵 handleActivate CALLED!')
    console.log('Agency ID:', agencyId)
    
    if (!confirm('Activate agensi ini?')) return
    setLoading(true)
    try {
      console.log('🟢 Calling activateAgency...')
      const result = await activateAgency(agencyId)
      console.log('🟢 Result:', result)
      if (result.success) {
        alert('Agensi berjaya di-activate!')
        router.refresh()
      }
    } catch (error: any) {
      console.error('🔴 Error:', error)
      alert('Gagal activate agensi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Verify / Unverify Button */}
      {isVerified ? (
        <button
          onClick={handleUnverify}
          disabled={loading}
          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors disabled:opacity-50"
          title="Remove verified badge"
        >
          {loading ? '...' : 'Unverify'}
        </button>
      ) : (
        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors disabled:opacity-50"
          title="Add verified badge"
        >
          {loading ? '...' : 'Verify'}
        </button>
      )}

      {/* Suspend / Activate Button */}
      {isActive ? (
        <button
          onClick={handleSuspend}
          disabled={loading}
          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors disabled:opacity-50"
          title="Suspend agency (block login)"
        >
          {loading ? '...' : 'Suspend'}
        </button>
      ) : (
        <button
          onClick={handleActivate}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors disabled:opacity-50"
          title="Activate agency (allow login)"
        >
          {loading ? '...' : 'Activate'}
        </button>
      )}
    </>
  )
}