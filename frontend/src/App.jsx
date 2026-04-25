import { useState } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { parseEther, formatEther } from 'viem'
import {
  VALIDA_CORE_ADDRESS,
  VALIDA_TOKEN_ADDRESS,
  VALIDA_CORE_ABI,
  VALIDA_TOKEN_ABI,
} from './config'

function shortAddr(addr) {
  if (!addr) return ''
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function Stars({ count }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= count ? '#f59e0b' : '#334155' }}>★</span>
      ))}
    </span>
  )
}

const inputStyle = {
  background: 'rgba(13, 17, 31, 0.88)',
  border: '1px solid rgba(148, 163, 184, 0.16)',
  borderRadius: '16px',
  padding: '14px 16px',
  color: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  resize: 'vertical',
}

const btnStyle = {
  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  padding: '12px 22px',
  fontSize: '14px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: '0 14px 40px rgba(139, 92, 246, 0.28)',
}

const ghostBtnStyle = {
  background: 'rgba(255,255,255,0.04)',
  color: '#e2e8f0',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: '14px',
  padding: '12px 18px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
}

const cardStyle = {
  background: 'linear-gradient(180deg, rgba(17,24,39,0.92), rgba(10,14,26,0.92))',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 30px 80px rgba(2, 6, 23, 0.35)',
}

function TokenBalance({ address }) {
  const { data: balance } = useReadContract({
    address: VALIDA_TOKEN_ADDRESS,
    abi: VALIDA_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
  })
  const formatted = balance ? parseFloat(formatEther(balance)).toFixed(2) : '0.00'
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(76,29,149,0.9), rgba(15,23,42,0.92))',
        border: '1px solid rgba(168,85,247,0.35)',
        borderRadius: '18px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span style={{ fontSize: '18px' }}>🏅</span>
      <div>
        <div style={{ color: '#f8fafc', fontWeight: '800', fontSize: '16px' }}>{formatted} HOST</div>
        <div style={{ color: '#c084fc', fontSize: '11px' }}>Reputación tokenizada</div>
      </div>
    </div>
  )
}

function HostAddressFetcher({ index, onRequest }) {
  const { data: address } = useReadContract({
    address: VALIDA_CORE_ADDRESS,
    abi: VALIDA_CORE_ABI,
    functionName: 'getHostAddress',
    args: [BigInt(index)],
  })
  if (!address) return null
  return <HostCard address={address} onRequest={onRequest} />
}

function HostCard({ address, onRequest }) {
  const { data: host } = useReadContract({
    address: VALIDA_CORE_ADDRESS,
    abi: VALIDA_CORE_ABI,
    functionName: 'hosts',
    args: [address],
  })
  const { data: rep } = useReadContract({
    address: VALIDA_CORE_ADDRESS,
    abi: VALIDA_CORE_ABI,
    functionName: 'getHostReputation',
    args: [address],
  })

  if (!host || !host[4]) return null

  const [name, description, location, isAvailable, , , , reviewCount] = host
  const reputation = rep ? Number(rep) : 0

  return (
    <div style={{ ...cardStyle, padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg,#8b5cf6,#22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '800',
              color: '#fff',
            }}
          >
            {name?.[0]?.toUpperCase() || 'H'}
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '20px' }}>{name}</h3>
            <p style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '13px' }}>📍 {location}</p>
          </div>
        </div>
        <span
          style={{
            background: isAvailable ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: isAvailable ? '#86efac' : '#fca5a5',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
          }}
        >
          {isAvailable ? 'Disponible' : 'Ocupado'}
        </span>
      </div>

      <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: '1.7' }}>{description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px' }}>
        <SignalCard label='Reputación' value={<Stars count={reputation} />} helper={`${Number(reviewCount)} estancias`} />
        <SignalCard label='Confianza' value='Bilateral' helper='reseñas de ambos lados' />
        <SignalCard label='Recomendación' value='Activa' helper='base para mejores matches' />
        <SignalCard label='Wallet' value={shortAddr(address)} helper='identidad on-chain' />
      </div>

      {isAvailable && (
        <button onClick={() => onRequest(address)} style={{ ...btnStyle, width: '100%' }}>
          Solicitar estancia · 0.001 MON
        </button>
      )}
    </div>
  )
}

function SignalCard({ label, value, helper }) {
  return (
    <div
      style={{
        borderRadius: '18px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(148,163,184,0.12)',
        padding: '12px 14px',
      }}
    >
      <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ color: '#f8fafc', fontWeight: '700', marginTop: '6px', fontSize: '14px' }}>{value}</div>
      <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{helper}</div>
    </div>
  )
}

function HostList({ onRequest }) {
  const { data: countRaw } = useReadContract({
    address: VALIDA_CORE_ADDRESS,
    abi: VALIDA_CORE_ABI,
    functionName: 'getHostCount',
  })
  const count = countRaw ? Number(countRaw) : 0

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ color: '#a78bfa', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px' }}>
          Descubrir anfitriones
        </div>
        <h2 style={{ color: '#f8fafc', margin: '0 0 8px', fontSize: '32px' }}>Hospedaje con calidez y reputación real</h2>
        <p style={{ color: '#94a3b8', margin: 0, maxWidth: '720px', lineHeight: '1.7' }}>
          Explora anfitriones en Monad Testnet con señales de confianza, reseñas y un diseño pensado para relaciones más humanas.
        </p>
      </div>

      {count === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '56px 24px', color: '#64748b' }}>
          <p style={{ fontSize: '48px', margin: 0 }}>🏠</p>
          <p style={{ marginBottom: 0 }}>Todavía no hay anfitriones. Sé la primera señal de confianza en la red.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '20px' }}>
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
      address: VALIDA_CORE_ADDRESS,
      abi: VALIDA_CORE_ABI,
      functionName: 'registerHost',
      args: [form.name, form.description, form.location],
    })
  }

  return (
    <div style={{ ...cardStyle, maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ color: '#a78bfa', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px' }}>
          Crear perfil anfitrión
        </div>
        <h2 style={{ color: '#f8fafc', margin: '0 0 8px', fontSize: '30px' }}>Abre tu espacio, construye reputación</h2>
        <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.7' }}>
          Presenta quién eres, qué ofreces y por qué un viajero debería confiar en ti. La experiencia empieza antes de la reserva.
        </p>
      </div>

      {isSuccess ? (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(15,23,42,0.9))',
            border: '1px solid rgba(34,197,94,0.35)',
            borderRadius: '18px',
            padding: '34px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🎉</p>
          <p style={{ color: '#86efac', fontWeight: '700', fontSize: '20px', margin: 0 }}>Ya eres anfitrión en Valida</p>
          <p style={{ color: '#bbf7d0', fontSize: '14px', marginTop: '8px' }}>Tu perfil vive on-chain y ya puede recibir solicitudes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
          {[
            { key: 'name', label: 'Tu nombre o identidad anfitriona', placeholder: 'María García', multi: false },
            { key: 'location', label: 'Ciudad y país', placeholder: 'Guadalajara, México', multi: false },
            {
              key: 'description',
              label: 'Describe tu espacio y tu estilo de hospitalidad',
              placeholder: 'Me gusta recibir viajeros con confianza, buena comunicación y recomendaciones locales...',
              multi: true,
            },
          ].map(({ key, label, placeholder, multi }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#cbd5e1', fontSize: '14px' }}>{label}</label>
              {multi ? (
                <textarea
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={5}
                  required
                  style={inputStyle}
                />
              ) : (
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  style={inputStyle}
                />
              )}
            </div>
          ))}
          <button type='submit' disabled={isPending || isConfirming} style={{ ...btnStyle, width: '100%' }}>
            {isPending ? 'Confirma en wallet...' : isConfirming ? 'Registrando en blockchain...' : 'Convertirme en anfitrión'}
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
      address: VALIDA_CORE_ADDRESS,
      abi: VALIDA_CORE_ABI,
      functionName: 'requestStay',
      args: [hostAddress],
      value: parseEther('0.001'),
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2,6,23,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
    >
      <div style={{ ...cardStyle, maxWidth: '460px', width: '100%' }}>
        <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '8px', fontSize: '24px' }}>Solicitar estancia</h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.7', marginTop: 0 }}>
          Estás iniciando una interacción basada en confianza mutua. Los fondos quedan protegidos y la reputación se construye al cierre.
        </p>
        <p style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{hostAddress}</p>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '24px',
            border: '1px solid rgba(148,163,184,0.1)',
          }}
        >
          <LineItem label='Reserva inicial' value='0.001 MON' />
          <LineItem label='Señal de confianza' value='reseña bilateral' />
          <LineItem label='Resultado esperado' value='estancia + reputación' noBorder />
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#86efac', fontWeight: '700', fontSize: '16px' }}>Solicitud enviada con éxito</p>
            <button onClick={onClose} style={{ ...btnStyle, width: '100%' }}>Cerrar</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ ...ghostBtnStyle, flex: 1 }}>Cancelar</button>
            <button onClick={handleRequest} disabled={isPending || isConfirming} style={{ ...btnStyle, flex: 2 }}>
              {isPending ? 'Confirma...' : isConfirming ? 'Enviando...' : 'Confirmar solicitud'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function LineItem({ label, value, noBorder = false }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        paddingBottom: noBorder ? 0 : '12px',
        marginBottom: noBorder ? 0 : '12px',
        borderBottom: noBorder ? 'none' : '1px solid rgba(148,163,184,0.1)',
      }}
    >
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color: '#f8fafc', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function Feature({ title, body }) {
  return (
    <div
      style={{
        borderRadius: '18px',
        padding: '16px 18px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(148,163,184,0.1)',
      }}
    >
      <div style={{ color: '#f8fafc', fontWeight: '700', marginBottom: '8px' }}>{title}</div>
      <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.65' }}>{body}</div>
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
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(168,85,247,0.20), transparent 24%), radial-gradient(circle at top right, rgba(45,212,191,0.14), transparent 20%), linear-gradient(180deg, #070b16 0%, #0b1020 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid rgba(148,163,184,0.12)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'rgba(7,11,22,0.72)',
          backdropFilter: 'blur(18px)',
          zIndex: 50,
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 18px 40px rgba(139,92,246,0.3)',
            }}
          >
            💜
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '20px', color: '#f8fafc' }}>Valida</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>hospitalidad solidaria sobre Monad</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {isConnected && <TokenBalance address={address} />}
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{shortAddr(address)}</span>
              <button onClick={() => disconnect()} style={ghostBtnStyle}>Disconnect</button>
            </div>
          ) : (
            <button onClick={() => connect({ connector: injected() })} style={btnStyle}>Conectar wallet</button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px 64px' }}>
        <section style={{ ...cardStyle, padding: '32px', marginBottom: '26px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-60px', left: '-20px', width: '220px', height: '220px', borderRadius: '999px', background: 'rgba(236,72,153,0.18)', filter: 'blur(70px)' }} />
            <div style={{ position: 'absolute', top: '-40px', right: '0', width: '220px', height: '220px', borderRadius: '999px', background: 'rgba(34,197,94,0.12)', filter: 'blur(70px)' }} />
          </div>

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {['Monad Testnet', 'Confianza entre humanos', 'Reputación y recomendación'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(148,163,184,0.1)',
                      color: '#d8b4fe',
                      fontSize: '12px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 style={{ color: '#f8fafc', fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.02, margin: '0 0 16px', fontWeight: '900' }}>
                Viajar debería sentirse
                <span style={{ display: 'block', background: 'linear-gradient(135deg,#c084fc,#5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  seguro, humano y recíproco.
                </span>
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '18px', lineHeight: '1.8', maxWidth: '700px', margin: 0 }}>
                Valida conecta viajeros y anfitriones con reglas on-chain, reseñas bilaterales y una vibra de hospitalidad solidaria.
                Aquí no solo reservas: construyes confianza y reputación útil para mejores estancias futuras.
              </p>

              {!isConnected && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                  <button onClick={() => connect({ connector: injected() })} style={{ ...btnStyle, fontSize: '16px', padding: '14px 28px' }}>
                    Conectar wallet para empezar
                  </button>
                  <button style={ghostBtnStyle} onClick={() => window.scrollTo({ top: 760, behavior: 'smooth' })}>
                    Ver cómo funciona
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <Feature title='Amor por los viajeros' body='La interfaz y el copy están pensados para transmitir cuidado, no frialdad financiera.' />
              <Feature title='Hospedaje solidario' body='La propuesta comunica afinidad, acompañamiento y mejores matches entre personas.' />
              <Feature title='Reputación verificable' body='Cada interacción cierra con señales reales que luego pueden alimentar recomendación.' />
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '26px' }}>
          <Feature title='Pago protegido' body='La reserva se inicia con 0.001 MON y queda ligada a reglas claras.' />
          <Feature title='Reseñas bilaterales' body='La confianza se construye entre ambos lados, no desde un intermediario opaco.' />
          <Feature title='Sistema de recomendación' body='La narrativa ya deja claro el siguiente paso del producto: mejores matches.' />
          <Feature title='Identidad on-chain' body='Cada anfitrión y viajero puede construir reputación portable.' />
        </section>

        {isConnected && (
          <section style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
              {[
                { id: 'discover', label: '🔍 Descubrir anfitriones' },
                { id: 'register', label: '🏠 Convertirme en anfitrión' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    background: tab === t.id ? 'linear-gradient(135deg,#8b5cf6,#ec4899)' : 'rgba(255,255,255,0.04)',
                    color: '#f8fafc',
                    border: '1px solid rgba(148,163,184,0.14)',
                    cursor: 'pointer',
                    padding: '12px 18px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: '700',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'discover' && <HostList onRequest={setRequestHost} />}
            {tab === 'register' && <RegisterHost />}
          </section>
        )}

        {!isConnected && (
          <section style={{ ...cardStyle, padding: '26px' }}>
            <div style={{ color: '#a78bfa', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px' }}>
              Cómo opera
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
              <Feature title='1. Conecta tu wallet' body='Entra a la red con tu identidad on-chain y accede a la experiencia completa.' />
              <Feature title='2. Elige o publica' body='Busca anfitriones alineados o abre tu espacio con una historia clara y honesta.' />
              <Feature title='3. Cierra la experiencia' body='La estancia produce reseñas, reputación y más contexto para futuras recomendaciones.' />
            </div>
          </section>
        )}
      </main>

      {requestHost && <RequestModal hostAddress={requestHost} onClose={() => setRequestHost(null)} />}

      <footer style={{ textAlign: 'center', padding: '0 20px 40px', color: '#64748b', fontSize: '13px' }}>
        Valida · hospedaje solidario · confianza entre humanos · Monad Testnet 🟣
      </footer>
    </div>
  )
}
