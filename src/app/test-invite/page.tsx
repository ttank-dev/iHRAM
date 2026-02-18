'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function TestInvite() {
  const [email, setEmail] = useState('ucu1980@gmail.com')
  const [result, setResult] = useState('')
  const supabase = createClient()

  const testSignUp = async () => {
    setResult('Testing signUp...')
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'TempPassword123!',
      options: {
        emailRedirectTo: 'https://ihram.com.my/reset-password',
        data: {
          full_name: 'Test User',
          role: 'admin'
        }
      }
    })

    if (error) {
      setResult(`❌ Error: ${error.message}`)
    } else {
      setResult(`✅ Success! Check email: ${email}`)
    }
  }

  const testForgotPassword = async () => {
    setResult('Testing forgot password...')
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://ihram.com.my/reset-password'
    })

    if (error) {
      setResult(`❌ Error: ${error.message}`)
    } else {
      setResult(`✅ Email sent! Check inbox`)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Email Test</h1>
      
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
      />

      <button onClick={testSignUp} style={{ padding: '10px 20px', marginRight: '10px' }}>
        Test SignUp (with email)
      </button>

      <button onClick={testForgotPassword} style={{ padding: '10px 20px' }}>
        Test Forgot Password
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0' }}>
          {result}
        </div>
      )}
    </div>
  )
}