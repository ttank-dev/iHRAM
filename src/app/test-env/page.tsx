'use client'

export default function TestEnvPage() {
  return (
    <div style={{ padding: '40px', color: 'white', backgroundColor: 'black' }}>
      <h1>Environment Variables Test</h1>
      <pre style={{ background: '#222', padding: '20px', marginTop: '20px' }}>
        NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING!'}
        {'\n\n'}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING!'}
      </pre>
    </div>
  )
}