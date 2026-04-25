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
        <span key={i} style={{ color: i <= count ? '#c27c3d' : '#d8d1c6' }}>★</span>
      ))}
    </span>
  )
}

const inputStyle = {
  background: '#f6f0e7',
  border: '1px solid #d8ccbd',
  borderRadius: '18px',
  padding: '14px 16px',
  color: '#3f332a',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  resize: 'vertical',
}

const btnStyle = {
  background: '#7d5a45',
  color: '#fffaf3',
  border: 'none',
  borderRadius: '999px',
  padding: '13px 24px',
  fontSize: '14px',
  fontWeight: '700',
  cursor: 'pointer',
}

const ghostBtnStyle = {
  background: 'transparent',
  color: '#5b4b40',
  border: '1px solid #cdbdaa',
  borderRadius: '999px',
  padding: '12px 18px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
}

const cardStyle = {
  background: '#fffaf4',
  border: '1px solid #eadfce',
  borderRadius: '28px',
  padding: '24px',
  boxShadow: '0 20px 60px rgba(112, 86, 64, 0.08)',
}

const editorialImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=900&q=80',
]

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
        background: '#efe5d8',
        border: '1px solid #dfcfba',
        borderRadius: '18px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span style={{ fontSize: '18px' }}>🏅</span>
      <div>
        <div style={{ color: '#4b3c30', fontWeight: '800', fontSize: '16px' }}>{formatted} HOST</div>
        <div style={{ color: '#8b6c56', fontSize: '11px' }}>reputación visible</div>
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
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' }}>
      <div
        style={{
          height: '180px',
          borderRadius: '22px',
          backgroundImage: `url(${editorialImages[Number(reviewCount) % editorialImages.length]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.04), rgba(44,33,24,0.28))',
            borderRadius: '22px',
          }}
        />
        <div style={{ position: 'absolute', left: '16px', bottom: '16px', color: '#fffaf3' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>refugio anfitrión</div>
          <div style={{ fontSize: '22px', fontWeight: '700' }}>{name}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <p style={{ margin: 0, color: '#8d7460', fontSize: '13px' }}>📍 {location}</p>
        </div>
        <span
          style={{
            background: isAvailable ? '#e4efe3' : '#f5e3de',
            color: isAvailable ? '#52684f' : '#9a5b4a',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            border: '1px solid #ded2c4',
            whiteSpace: 'nowrap',
          }}
        >
          {isAvailable ? 'Disponible' : 'Ocupado'}
        </span>
      </div>

      <p style={{ margin: 0, color: '#5e4f43', fontSize: '14px', lineHeight: '1.75' }}>{description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px' }}>
        <SignalCard label='Reputación' value={<Stars count={reputation} />} helper={`${Number(reviewCount)} estancias`} />
        <SignalCard label='Confianza' value='Mutua' helper='ambos dejan señal' />
        <SignalCard label='Sensación' value='Refugio' helper='hospitalidad y cuidado' />
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
        background: '#f6efe5',
        border: '1px solid #e6d8c8',
        padding: '12px 14px',
      }}
    >
      <div style={{ color: '#907760', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ color: '#47392f', fontWeight: '700', marginTop: '6px', fontSize: '14px' }}>{value}</div>
      <div style={{ color: '#7f6a58', fontSize: '12px', marginTop: '4px' }}>{helper}</div>
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
        <div style={{ color: '#a07c61', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px' }}>
          descubrir anfitriones
        </div>
        <h2 style={{ color: '#3f332a', margin: '0 0 8px', fontSize: '32px' }}>Espacios que se sientan como nido</h2>
        <p style={{ color: '#6d5b4e', margin: 0, maxWidth: '720px', lineHeight: '1.8' }}>
          Explora perfiles con una estética más humana, señales de confianza y una narrativa enfocada en refugio, comunidad y buena hospitalidad.
        </p>
      </div>

      {count === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '56px 24px', color: '#7f6a58' }}>
          <p style={{ fontSize: '48px', margin: 0 }}>🏠</p>
          <p style={{ marginBottom: 0 }}>Todavía no hay anfitriones. Aquí puede empezar una red más cálida.</p>
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
        <div style={{ color: '#a07c61', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px' }}>
          crear perfil anfitrión
        </div>
        <h2 style={{ color: '#3f332a', margin: '0 0 8px', fontSize: '30px' }}>Abre un refugio, no solo un espacio</h2>
        <p style={{ color: '#6d5b4e', margin: 0, lineHeight: '1.8' }}>
          Cuéntale a la comunidad cómo hospedas, qué cuidas y qué sensación quieres dejar en quien llegue.
        </p>
      </div>

      {isSuccess ? (
        <div
          style={{
            background: '#edf2e7',
            border: '1px solid #d7e0cc',
            borderRadius: '18px',
            padding: '34px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🌿</p>
          <p style={{ color: '#52684f', fontWeight: '700', fontSize: '20px', margin: 0 }}>Ya formas parte de la comunidad anfitriona</p>
          <p style={{ color: '#6e826a', fontSize: '14px', marginTop: '8px' }}>Tu perfil vive on-chain y ya puede recibir solicitudes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
          {[
            { key: 'name', label: 'Tu nombre o identidad anfitriona', placeholder: 'María García', multi: false },
            { key: 'location', label: 'Ciudad y país', placeholder: 'Guadalajara, México', multi: false },
            {
              key: 'description',
              label: 'Describe tu espacio, tu hospitalidad y tu forma de cuidar',
              placeholder: 'Me gusta recibir viajeros con calma, buena conversación, seguridad y recomendaciones locales...',
              multi: true,
            },
          ].map(({ key, label, placeholder, multi }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#5d4f42', fontSize: '14px' }}>{label}</label>
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
        background: 'rgba(73, 56, 43, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ ...cardStyle, maxWidth: '460px', width: '100%' }}>
        <h3 style={{ color: '#3f332a', marginTop: 0, marginBottom: '8px', fontSize: '24px' }}>Solicitar estancia</h3>
        <p style={{ color: '#6d5b4e', fontSize: '13px', lineHeight: '1.8', marginTop: 0 }}>
          Esta solicitud abre una relación de confianza. El pago queda protegido y la experiencia termina construyendo reputación para ambos.
        </p>
        <p style={{ color: '#8d7460', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{hostAddress}</p>

        <div
          style={{
            background: '#f6efe5',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '24px',
            border: '1px solid #e3d7c9',
          }}
        >
          <LineItem label='Reserva inicial' value='0.001 MON' />
          <LineItem label='Señal de confianza' value='reseña bilateral' />
          <LineItem label='Resultado esperado' value='refugio + reputación' noBorder />
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#52684f', fontWeight: '700', fontSize: '16px' }}>Solicitud enviada con éxito</p>
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
        borderBottom: noBorder ? 'none' : '1px solid #e5dacc',
      }}
    >
      <span style={{ color: '#7f6a58' }}>{label}</span>
      <span style={{ color: '#43362c', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function Feature({ title, body }) {
  return (
    <div
      style={{
        borderRadius: '22px',
        padding: '18px 18px',
        background: '#f8f2e8',
        border: '1px solid #eadfce',
      }}
    >
      <div style={{ color: '#43362c', fontWeight: '700', marginBottom: '8px' }}>{title}</div>
      <div style={{ color: '#6f5d50', fontSize: '14px', lineHeight: '1.75' }}>{body}</div>
    </div>
  )
}

function ImageCluster() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '14px', alignItems: 'stretch' }}>
      <div
        style={{
          minHeight: '360px',
          borderRadius: '36px',
          backgroundImage: `url(${editorialImages[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,250,244,0.02), rgba(68,49,33,0.34))' }} />
        <div style={{ position: 'absolute', left: '18px', bottom: '18px', right: '18px', color: '#fffaf3' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>comunidad</div>
          <div style={{ fontSize: '26px', fontWeight: '700', lineHeight: 1.2 }}>Espacios que abrazan a quien llega</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '14px' }}>
        <div
          style={{
            minHeight: '173px',
            borderRadius: '28px',
            backgroundImage: `url(${editorialImages[1]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          style={{
            minHeight: '173px',
            borderRadius: '28px',
            backgroundImage: `url(${editorialImages[2]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
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
    <div
      style={{
        minHeight: '100vh',
        background: '#f4ede3',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid #e4d7c7',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'rgba(244,237,227,0.88)',
          backdropFilter: 'blur(14px)',
          zIndex: 50,
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              background: '#d8c0a6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            🪺
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '22px', color: '#3f332a' }}>Valida</div>
            <div style={{ fontSize: '11px', color: '#8d7460', fontFamily: 'Inter, system-ui, sans-serif' }}>nido, confianza y hospitalidad</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {isConnected && <TokenBalance address={address} />}
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ color: '#8d7460', fontSize: '13px' }}>{shortAddr(address)}</span>
              <button onClick={() => disconnect()} style={ghostBtnStyle}>Disconnect</button>
            </div>
          ) : (
            <button onClick={() => connect({ connector: injected() })} style={btnStyle}>Conectar wallet</button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px 64px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '26px', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '6px 4px' }}>
            <div style={{ color: '#9b7b64', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.24em', marginBottom: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}>
              hospitalidad solidaria sobre monad
            </div>
            <h1 style={{ color: '#3b2f28', fontSize: 'clamp(42px, 6vw, 72px)', lineHeight: 1.02, margin: '0 0 18px', fontWeight: '700' }}>
              Un lugar para llegar,
              <span style={{ display: 'block', color: '#7f5d49' }}>ser recibido y confiar.</span>
            </h1>
            <p style={{ color: '#655347', fontSize: '19px', lineHeight: '1.9', maxWidth: '720px', margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
              Valida quiere sentirse menos como una plataforma fría y más como una red de refugios humanos:
              viajeros, anfitriones, reputación, comunidad y recomendaciones nacidas de experiencias reales.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {!isConnected && (
                <button onClick={() => connect({ connector: injected() })} style={{ ...btnStyle, fontSize: '16px', padding: '14px 28px' }}>
                  Conectar wallet
                </button>
              )}
              <button style={ghostBtnStyle} onClick={() => window.scrollTo({ top: 780, behavior: 'smooth' })}>
                Explorar comunidad
              </button>
            </div>
          </div>

          <ImageCluster />
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px', marginBottom: '28px' }}>
          <div style={{ ...cardStyle, background: '#f8f2e8' }}>
            <div style={{ color: '#9b7b64', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px', fontFamily: 'Inter, system-ui, sans-serif' }}>
              visión de producto
            </div>
            <h2 style={{ color: '#3f332a', margin: '0 0 12px', fontSize: '34px' }}>Más hogar, menos interfaz genérica</h2>
            <p style={{ color: '#675549', lineHeight: '1.85', marginTop: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
              El rediseño busca expresar nido, refugio y solidaridad. Menos brillos “AI”, más texturas suaves, tonos tierra,
              espacios respirables e imágenes que parezcan vida real. La idea no es solo “verse bonito”, sino transmitir una
              promesa emocional coherente con la experiencia que queremos construir.
            </p>
          </div>
          <div style={{ ...cardStyle, background: '#efe4d4' }}>
            <div style={{ color: '#3f332a', fontWeight: '700', marginBottom: '14px', fontSize: '20px' }}>Señales que queremos transmitir</div>
            <div style={{ display: 'grid', gap: '10px', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {[
                'refugio antes que transacción',
                'confianza mutua y visible',
                'comunidad con calidez',
                'recomendación basada en reputación',
              ].map((item) => (
                <div key={item} style={{ padding: '12px 14px', borderRadius: '16px', background: '#f8f1e7', border: '1px solid #e3d6c6', color: '#69584b' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '28px', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <Feature title='Nido' body='El layout abraza al usuario con espacios suaves, rounded corners y una lectura más editorial.' />
          <Feature title='Comunidad' body='Las imágenes y el copy priorizan vínculos, no solo flujo transaccional.' />
          <Feature title='Solidaridad' body='La estética comunica cuidado, hospitalidad y alojamiento con intención humana.' />
          <Feature title='Reputación' body='La experiencia deja claro que cada estancia aporta señales para futuros matches.' />
        </section>

        {isConnected && (
          <section style={{ marginBottom: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
              {[
                { id: 'discover', label: '🔎 Descubrir anfitriones' },
                { id: 'register', label: '🏡 Crear perfil anfitrión' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    background: tab === t.id ? '#7d5a45' : '#f7efe5',
                    color: tab === t.id ? '#fffaf3' : '#5d4f42',
                    border: '1px solid #dbcdbd',
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
          <section style={{ ...cardStyle, background: '#fff8f1', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ color: '#9b7b64', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '10px' }}>
              cómo se siente el flujo
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
              <Feature title='1. Llegas' body='Conectas tu wallet y entras a un espacio que comunica cuidado desde el primer vistazo.' />
              <Feature title='2. Encuentras tu match' body='Exploras anfitriones con mejor narrativa, señales humanas y reputación visible.' />
              <Feature title='3. Dejas huella' body='La estancia termina alimentando confianza y futuras recomendaciones dentro de la red.' />
            </div>
          </section>
        )}
      </main>

      {requestHost && <RequestModal hostAddress={requestHost} onClose={() => setRequestHost(null)} />}

      <footer style={{ textAlign: 'center', padding: '0 20px 40px', color: '#8d7460', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Valida · refugio, comunidad y confianza entre humanos · Monad Testnet
      </footer>
    </div>
  )
}
