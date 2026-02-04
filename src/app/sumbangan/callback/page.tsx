import Link from 'next/link'

export default function CallbackPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; error?: string }>
}) {
  const getParams = async () => await searchParams
  const params = getParams()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        {/* Success */}
        <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '48px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>
            ✅
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', color: '#10B981' }}>
            Terima Kasih!
          </h1>
          <p style={{ fontSize: '18px', color: '#A0A0A0', lineHeight: '1.6', marginBottom: '32px' }}>
            Sumbangan anda amat dihargai dan akan digunakan untuk meningkatkan platform iHRAM.
          </p>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
            Anda akan menerima pengesahan melalui email sebentar lagi.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link
              href="/"
              style={{ padding: '14px 32px', backgroundColor: '#D4AF37', color: 'black', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600' }}
            >
              Kembali ke Homepage
            </Link>
            <Link
              href="/pakej"
              style={{ padding: '14px 32px', backgroundColor: '#2A2A2A', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600' }}
            >
              Terokai Pakej
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}