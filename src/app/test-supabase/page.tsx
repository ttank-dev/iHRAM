import { supabase } from '@/lib/supabase'

export default async function TestPage() {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .limit(1)

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Supabase Connection Test</h1>
      <div>
        <h2>URL:</h2>
        <pre>{process.env.NEXT_PUBLIC_SUPABASE_URL}</pre>
      </div>
      <div>
        <h2>Key (first 50 chars):</h2>
        <pre>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50)}...</pre>
      </div>
      <div>
        <h2>Error:</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
      <div>
        <h2>Data:</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}