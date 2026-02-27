'use client'

import { useState } from 'react'

export default function DonationForm() {
  const [amount, setAmount] = useState<string>('')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('fpx')
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')

  const presetAmounts = [10, 25, 50, 100, 200, 500]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const donationAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount)
    
    if (!donationAmount || donationAmount < 1) {
      alert('Sila masukkan jumlah yang sah')
      return
    }

    // TODO: Integrate with payment gateway (Toyyibpay/Billplz)
    console.log('Processing donation:', {
      amount: donationAmount,
      paymentMethod,
      name,
      email,
      phone
    })

    // Redirect to payment gateway
    alert(`Pembayaran RM ${donationAmount} akan diproses. \n\nIntegrasi payment gateway akan dilakukan kemudian.`)
  }

  return (
    <div className="sb-donation-form" style={{ 
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '2px solid #B8936D',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
    }}>
      <div style={{ 
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        marginBottom: '24px'
      }}>
        💳
      </div>

      <h3 style={{ 
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2C2C2C',
        marginBottom: '12px'
      }}>
        Bayaran Online
      </h3>

      <p style={{ 
        fontSize: '15px',
        color: '#666',
        marginBottom: '32px',
        lineHeight: '1.6'
      }}>
        Bayar dengan selamat menggunakan FPX, Kad Kredit/Debit, atau e-Wallet
      </p>

      <form onSubmit={handleSubmit}>
        
        {/* Preset Amounts */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '12px'
          }}>
            Pilih Jumlah
          </label>
          <div className="sb-preset-grid" style={{ display: 'grid', gap: '12px' }}>
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmount(preset.toString())
                  setCustomAmount('')
                }}
                style={{ 
                  padding: '16px',
                  backgroundColor: amount === preset.toString() ? '#B8936D' : 'transparent',
                  color: amount === preset.toString() ? 'white' : '#2C2C2C',
                  border: amount === preset.toString() ? 'none' : '2px solid #E5E5E0',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                RM {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setAmount('custom')}
            style={{ 
              width: '100%',
              padding: '12px',
              backgroundColor: amount === 'custom' ? '#B8936D' : 'transparent',
              color: amount === 'custom' ? 'white' : '#666',
              border: amount === 'custom' ? 'none' : '2px solid #E5E5E0',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'all 0.3s'
            }}
          >
            Jumlah Lain
          </button>
          
          {amount === 'custom' && (
            <div style={{ position: 'relative' }}>
              <span style={{ 
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                fontWeight: '700',
                color: '#B8936D'
              }}>
                RM
              </span>
              <input 
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                required={amount === 'custom'}
                style={{ 
                  width: '100%',
                  padding: '14px 16px 14px 52px',
                  fontSize: '18px',
                  fontWeight: '700',
                  border: '2px solid #B8936D',
                  borderRadius: '10px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '12px'
          }}>
            Cara Pembayaran
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* FPX */}
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: paymentMethod === 'fpx' ? '#FFF8F0' : '#F5F5F0',
              border: paymentMethod === 'fpx' ? '2px solid #B8936D' : '2px solid transparent',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <input 
                type="radio"
                name="paymentMethod"
                value="fpx"
                checked={paymentMethod === 'fpx'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                  🏦 FPX (Online Banking)
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  Maybank, CIMB, Public Bank, dan lain-lain
                </div>
              </div>
            </label>

            {/* Credit/Debit Card */}
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: paymentMethod === 'card' ? '#FFF8F0' : '#F5F5F0',
              border: paymentMethod === 'card' ? '2px solid #B8936D' : '2px solid transparent',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <input 
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                  💳 Kad Kredit/Debit
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  Visa, Mastercard
                </div>
              </div>
            </label>

            {/* E-Wallet */}
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: paymentMethod === 'ewallet' ? '#FFF8F0' : '#F5F5F0',
              border: paymentMethod === 'ewallet' ? '2px solid #B8936D' : '2px solid transparent',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <input 
                type="radio"
                name="paymentMethod"
                value="ewallet"
                checked={paymentMethod === 'ewallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                  📱 E-Wallet
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  Touch 'n Go, GrabPay, Boost
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Personal Details */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Nama Penuh *
          </label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama anda"
            required
            style={{ 
              width: '100%',
              boxSizing: 'border-box' as const,
              padding: '14px 16px',
              fontSize: '15px',
              border: '2px solid #E5E5E0',
              borderRadius: '10px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Email *
          </label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            style={{ 
              width: '100%',
              boxSizing: 'border-box' as const,
              padding: '14px 16px',
              fontSize: '15px',
              border: '2px solid #E5E5E0',
              borderRadius: '10px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            No. Telefon
          </label>
          <input 
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01X-XXX XXXX"
            style={{ 
              width: '100%',
              boxSizing: 'border-box' as const,
              padding: '14px 16px',
              fontSize: '15px',
              border: '2px solid #E5E5E0',
              borderRadius: '10px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={!amount || (amount === 'custom' && !customAmount) || !name || !email}
          style={{ 
            width: '100%',
            padding: '18px',
            backgroundColor: '#B8936D',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 16px rgba(184,147,109,0.3)',
            opacity: (!amount || (amount === 'custom' && !customAmount) || !name || !email) ? 0.5 : 1
          }}
        >
          Teruskan ke Pembayaran →
        </button>

        <p style={{ 
          fontSize: '13px',
          color: '#999',
          marginTop: '16px',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          🔒 Pembayaran selamat & dilindungi. <br />
          Resit rasmi akan dihantar ke email anda.
        </p>
      </form>
    </div>
  )
}