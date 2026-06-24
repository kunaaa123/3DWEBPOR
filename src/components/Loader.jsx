import { useProgress } from '@react-three/drei'
import { useState, useEffect } from 'react'

const Loader = () => {
  const { progress } = useProgress()
  const [dots, setDots] = useState('')
  const [smoothedProgress, setSmoothedProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 400)
    return () => clearInterval(interval)
  }, [])

  // Smoothly increment progress
  useEffect(() => {
    const updateProgress = () => {
      setSmoothedProgress(prev => {
        if (prev < progress) {
          // Slowly climb to the actual progress
          const diff = progress - prev
          const step = Math.max(0.1, diff * 0.1) // Adjust 0.1 for speed (lower = slower)
          return Math.min(progress, prev + step)
        }
        return prev
      })
    }

    const timer = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(timer)
  }, [progress, smoothedProgress])

  const pct = Math.round(smoothedProgress)
  const isFinished = smoothedProgress >= 100 && progress >= 100

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      background: '#050505',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: "'Outfit', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Ambient glow background */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Logo / Title */}
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.6em',
        color: 'rgba(255,255,255,0.25)',
        textTransform: 'uppercase',
        marginBottom: '50px',
      }}>
        Portfolio
      </div>

      {/* Big percentage number */}
      <div style={{
        position: 'relative',
        marginBottom: '40px',
      }}>
        <span style={{
          fontSize: '80px',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontFamily: "'Outfit', sans-serif",
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,1) ${pct}%, rgba(255,255,255,0.15) ${pct}%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {String(pct).padStart(3, '0')}
        </span>
        <span style={{
          fontSize: '18px',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.3)',
          marginLeft: '4px',
          verticalAlign: 'top',
          lineHeight: '80px',
        }}>%</span>
      </div>

      {/* Progress bar container */}
      <div style={{
        width: '280px',
        position: 'relative',
        marginBottom: '30px',
      }}>
        {/* Track */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'rgba(255,255,255,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Fill */}
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.8))',
            transition: 'width 0.3s ease-out',
            position: 'relative',
          }}>
            {/* Glow dot at end */}
            <div style={{
              position: 'absolute',
              right: '-3px',
              top: '-3px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 0 12px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.3)',
            }} />
          </div>
        </div>

        {/* Tick marks */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
        }}>
          {[0, 25, 50, 75, 100].map(tick => (
            <div key={tick} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}>
              <div style={{
                width: '1px',
                height: tick % 50 === 0 ? '6px' : '4px',
                background: pct >= tick ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s ease',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Status text */}
      <div style={{
        fontSize: '10px',
        fontWeight: 400,
        letterSpacing: '0.35em',
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
      }}>
        {pct < 100 ? `Loading assets${dots}` : 'Initializing'}
      </div>

      {/* Decorative corner lines */}
      <svg style={{ position: 'absolute', top: '30px', left: '30px', opacity: 0.1 }} width="40" height="40">
        <line x1="0" y1="0" x2="40" y2="0" stroke="white" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
      </svg>
      <svg style={{ position: 'absolute', top: '30px', right: '30px', opacity: 0.1 }} width="40" height="40">
        <line x1="0" y1="0" x2="40" y2="0" stroke="white" strokeWidth="1" />
        <line x1="40" y1="0" x2="40" y2="40" stroke="white" strokeWidth="1" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '30px', left: '30px', opacity: 0.1 }} width="40" height="40">
        <line x1="0" y1="40" x2="40" y2="40" stroke="white" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '30px', right: '30px', opacity: 0.1 }} width="40" height="40">
        <line x1="0" y1="40" x2="40" y2="40" stroke="white" strokeWidth="1" />
        <line x1="40" y1="0" x2="40" y2="40" stroke="white" strokeWidth="1" />
      </svg>

      {/* Scan line animation */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

export default Loader
