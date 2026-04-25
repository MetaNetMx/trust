import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { parseEther, formatEther } from 'viem'
import { VALIDA_CORE_ADDRESS, VALIDA_TOKEN_ADDRESS, VALIDA_CORE_ABI, VALIDA_TOKEN_ABI } from './config'

function shortAddr(addr) {
  if (!addr) return ''
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function Stars({ count }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= count ? '#f59e0b' : '#374151' }}>★</span>
      ))}
    </span>
  )
}

const inputStyle = {
  background: '#0f0f1a', border: '1px solid #2d2d4a', borderRadius: '10px',
  padding: '12px 16px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
  width: '100%', boxSizing: 'border-box', resize: 'vertical'
}

const btnStyle = {
  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff',
  border: 'none', borderRadius: '10px', padding: '12px 24px',
  fontSize: '14px', fontWeight: '600', cursor: 'pointer'
}

function TokenBalance({ address }) {
  const { data: balance } = useReadContract({
    address: VALIDA_TOKEN_ADDRESS, abi: VALIDA_TOKEN_ABI,
    functionName: 'balanceOf', args: [address]
  })
  const formatted = balance ? parseFloat(formatEther(balance)).toFixed(2) : '0.00'
  return (
    <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#1a1a2e)', border: '1px solid #4c1d95', borderRadius: '12px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '18px' }}>🏅</span>
      <div>
        <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px' }}>{formatted} HOST</div>
        <div style={{ color: '#7c3aed', fontSize: '11px' }}>Valida Tokens</div>
      </div>
    </div>
  )
}

function HostAddressFetcher({ index, onRequest }) {
  const { data: address } = useReadContract({
    address: VALIDA_CORE_ADDRESS, abi: VALIDA_CORE_ABI,
    functionName: 'getHostAddress', args: [BigInt(index)]
  })
  if (!address) return null
  return <HostCard address={address} onRequest={onRequest} />
}

function HostCard({ address, onRequest }) {
  const { data: host } = useReadContract({
    address: VALIDA_CORE_ADDRESS, abi: VALIDA_CORE_ABI,
    functionName: 'hosts', args: [address]
  })
  const { data: rep } = useReadContract({
    address: VALIDA_CORE_ADDRESS, abi: VALIDA_CORE_ABI,
    functionName: 'getHostReputation', args: [address]
  })
  if (!host || !host[4]) return null
  const [name, description, location, isAvailable, , , , reviewCount] = host
  const reputation = rep ? Number(rep) : 0
  return (
    <div style={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
          {name[0]?.toUpperCase()}
        </div>
        <span style={{ background: isAvailable ? '#064e3b' : '#450a0a', color: isAvailable ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
          {isAvailable ? '● Available' : '● Busy'}
        </span>
      </div>
      <div>
        <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '18px' }}>{name}</h3>
        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>📍 {location}</p>
      </div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Stars count={reputation} />
          <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>{Number(reviewCount)} stays</span>
        </div>
        <span style={{ color: '#64748b', fontSize: '12px' }}>{shortAddr(address)}</span>
      </div>
      {isAvailable && (
        <button onClick={() => onRequest(address)} style={btnStyle}>
          Request Stay · 0.001 MON
        </button>
      )}
    </div>
  )
}

function HostList({ onRequest }) {
  const { data: countRaw } = useReadContract({
    address: VALIDA_CORE_ADDRESS, abi: VALIDA_CORE_ABI, functionName: 'getHostCount'
  })
  const count = countRaw ? Number(countRaw) : 0
  return (
    <div>
      <h2 style={{ color: '#f1f5f9', marginBottom: '8px' }}>Find a Host</h2>
      <p style={{ color: '#64748b', marginTop: 0, marginBottom: '24px' }}>{count} hosts on Monad Testnet</p>
      {count === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          <p style={{ fontSize: '48px', margin: 0 }}>🏠</p>
          <p>No hosts yet. Be the first to register!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
          {Array.from({ length: count }, (_, i) => (
            <HostAddressFetcher key={i} index={i} onRequest={onRequest} />
          ))}
        </div>
      )}
    </div>
  )
}

function RegisterHost() {
  const [form, setForm] = useState({ name: '', description: '', location: '' })
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  function handleSubmit(e) {
    e.preventDefault()
    writeContract({
      address: VALIDA_CORE_ADDRESS, abi: VALIDA_CORE_ABI,
      functionName: 'registerHost',
      args: [form.name, form.description, form.location]
    })
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '8px' }}>Register as Host</h2>
      <p style={{ color: '#64748b', marginTop: 0, marginBottom: '32px' }}>Open your home and earn HOST tokens for every great stay.</p>
      {isSuccess ? (
        <div style={{ background: '#064e3b', border: '1px solid #10b981', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🎉</p>
          <p style={{ color: '#10b981', fontWeight: '600', fontSize: '18px', margin: 0 }}>You are now a Valida host!</p>
          <p style={{ color: '#6ee7b7', fontSize: '14px', marginTop: '8px' }}>Your profile is live on Monad blockchain.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'name', label: 'Your name', placeholder: 'Maria Garcia', multi: false },
            { key: 'location', label: 'City, Country', placeholder: 'Mexico City, Mexico', multi: false },
            { key: 'description', label: 'About you and your space', placeholder: 'I love meeting travelers from around the world...', multi: true }
          ].map(({ key, label, placeholder, multi }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#94a3b8', fontSize: '14px' }}>{label}</label>
              {multi ? (
                <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} rows={4} required style={inputStyle} />
              ) : (
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} required style={inputStyle} />
              )}
            </div>
          ))}
          <button type="submit" disabled={isPending || isConfirming} style={btnStyle}>
            {isPending ? 'Confirm in wallet...' : isConfirming ? 'Registering on blockchain...' : 'Register as Host'}
          </button>
        </form>
      )}
    </div>
  )
}

function RequestModal({ hostAddress, onClose }) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  function handleRequest() {
    writeContract({
      address: VALIDA_CORE_ADDRESS, abi: VALIDA_CORE_ABI,
      functionName: 'requestStay', args: [hostAddress],
      value: parseEther('0.001')
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%' }}>
        <h3 style={{ color: '#f1f5f9', marginTop: 0 }}>Request Stay</h3>
        <p style={{ color: '#64748b', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{hostAddress}</p>
        <div style={{ background: '#0f0f1a', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Fee</span><span style={{ color: '#f1f5f9' }}>0.001 MON</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Host receives</span><span style={{ color: '#10b981' }}>0.0007 MON</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Platform</span><span style={{ color: '#94a3b8' }}>0.0002 MON</span>
          </div>
        </div>
        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#10b981', fontWeight: '600' }}>Request sent successfully!</p>
            <button onClick={onClose} style={{ ...btnStyle, width: '100%' }}>Close</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ ...btnStyle, background: '#1e293b', flex: 1 }}>Cancel</button>
            <button onClick={handleRequest} disabled={isPending || isConfirming} style={{ ...btnStyle, flex: 2 }}>
              {isPending ? 'Confirm...' : isConfirming ? 'Sending...' : 'Confirm'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [tab, setTab] = useState('discover')
  const [requestHost, setRequestHost] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', fontFamily: 'system-ui,sans-serif' }}>
      <header style={{ borderBottom: '1px solid #1e1e3a', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0f0f1a', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤝</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '20px', color: '#f1f5f9' }}>Valida</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Trust between humans</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isConnected && <TokenBalance address={address} />}
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>{shortAddr(address)}</span>
              <button onClick={() => disconnect()} style={{ background: 'transparent', border: '1px solid #2d2d4a', borderRadius: '8px', padding: '8px 16px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Disconnect</button>
            </div>
          ) : (
            <button onClick={() => connect({ connector: injected() })} style={btnStyle}>Connect Wallet</button>
          )}
        </div>
      </header>

      {!isConnected && (
        <div style={{ textAlign: 'center', padding: '100px 32px 60px' }}>
          <h1 style={{ fontSize: '52px', fontWeight: '900', margin: '0 0 16px', color: '#f1f5f9', lineHeight: 1.1 }}>
            Travel with{' '}
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>trust</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '500px', margin: '0 auto 40px' }}>
            The first decentralized hospitality network on Monad. Hosts earn HOST tokens for every great stay.
          </p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '48px' }}>
            {['🏠 Host travelers', '🏅 Earn HOST tokens', '🔒 Trustless reviews'].map(f => (
              <div key={f} style={{ color: '#7c3aed', fontWeight: '600' }}>{f}</div>
            ))}
          </div>
          <button onClick={() => connect({ connector: injected() })} style={{ ...btnStyle, fontSize: '16px', padding: '14px 36px' }}>
            Connect Wallet to Start
          </button>
        </div>
      )}

      {isConnected && (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid #1e1e3a' }}>
            {[{ id: 'discover', label: '🔍 Discover Hosts' }, { id: 'register', label: '🏠 Become a Host' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 20px', fontSize: '15px', fontWeight: '600', color: tab === t.id ? '#7c3aed' : '#64748b', borderBottom: tab === t.id ? '2px solid #7c3aed' : '2px solid transparent', marginBottom: '-1px' }}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'discover' && <HostList onRequest={setRequestHost} />}
          {tab === 'register' && <RegisterHost />}
        </main>
      )}

      {requestHost && <RequestModal hostAddress={requestHost} onClose={() => setRequestHost(null)} />}

      <footer style={{ textAlign: 'center', padding: '40px', color: '#1e293b', fontSize: '13px', marginTop: '40px' }}>
        Valida — Built on Monad Testnet 🟣
      </footer>
    </div>
  )
}
