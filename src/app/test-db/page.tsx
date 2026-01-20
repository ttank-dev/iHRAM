import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .limit(1)
    
    return (
      <div className="p-8 bg-black text-white min-h-screen">
        <h1 className="text-2xl mb-4">Supabase Test</h1>
        {error ? (
          <div className="text-red-500">
            <p>Error: {error.message}</p>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-green-500">
            <p>✅ Connection successful!</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  } catch (err: any) {
    return (
      <div className="p-8 bg-black text-white min-h-screen">
        <h1 className="text-2xl mb-4 text-red-500">Error!</h1>
        <pre>{err?.message || 'Unknown error'}</pre>
      </div>
    )
  }
}