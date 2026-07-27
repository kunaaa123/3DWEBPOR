import { useProgress } from '@react-three/drei'
import { useState, useEffect } from 'react'

const Loader = ({ modelReady, onFinished }) => {
  const { active, progress, loaded, total } = useProgress()
  const [modelProgress, setModelProgress] = useState(0)
  const [smoothedProgress, setSmoothedProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('กำลังเปิดอ่านบันทึก...')

  // Listen to real-time byte-by-byte streaming progress for the 121MB 3D model
  useEffect(() => {
    const handleProgress = (e) => setModelProgress(e.detail)
    window.addEventListener('model-download-progress', handleProgress)
    return () => window.removeEventListener('model-download-progress', handleProgress)
  }, [])

  // Smoothly increment progress number-by-number without jumping
  useEffect(() => {
    let animationFrameId
    const updateProgress = () => {
      setSmoothedProgress(prev => {
        if (prev >= 100) return 100

        // Target progress combines streaming model download progress and Drei texture progress
        let target = Math.max(progress, modelProgress)

        // Set target to 100% when model download completes or Drei finishes
        if (modelProgress >= 100 || progress >= 100 || (!active && loaded > 0)) {
          target = 100
        }

        if (prev < target) {
          const diff = target - prev
          const step = Math.min(4.0, Math.max(0.5, diff * 0.25))
          const next = prev + step
          return next >= 99.5 ? 100 : next
        }

        return prev
      })
      animationFrameId = requestAnimationFrame(updateProgress)
    }

    animationFrameId = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(animationFrameId)
  }, [progress, active, loaded, total, modelProgress, modelReady])

  // Trigger onFinished when smoothedProgress reaches 100% AND 3D model is fully ready
  useEffect(() => {
    if (smoothedProgress >= 100 && modelReady) {
      const timer = setTimeout(() => {
        if (onFinished) onFinished()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [smoothedProgress, modelReady, onFinished])

  const pct = Math.round(smoothedProgress)

  // Cycle through warm book-themed messages as progress increases
  useEffect(() => {
    if (pct < 25) {
      setLoadingText('กำลังหยิบสมุดบันทึก...')
    } else if (pct < 50) {
      setLoadingText('กำลังเปิดหน้ากระดาษ...')
    } else if (pct < 75) {
      setLoadingText('กำลังจัดเตรียมภาพวาด 3 มิติ...')
    } else if (pct < 95) {
      setLoadingText('กำลังปรับแสงสว่างบนโต๊ะเขียนแบบ...')
    } else {
      setLoadingText('จัดเตรียมหน้าหนังสือเรียบร้อย...')
    }
  }, [pct])

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      // Notebook ruled paper background using gradients
      background: `
        linear-gradient(90deg, transparent 79px, rgba(112, 92, 72, 0.12) 79px, rgba(112, 92, 72, 0.12) 81px, transparent 81px),
        linear-gradient(rgba(112, 92, 72, 0.05) 1px, transparent 1px) 0 0 / 100% 24px,
        #faf7f2
      `,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: "'Outfit', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Book CSS Animation Styles */}
      <style>{`
        .book-container {
          width: 70px;
          height: 48px;
          position: relative;
          margin-bottom: 35px;
          perspective: 200px;
        }
        .book-spine {
          position: absolute;
          left: 50%;
          top: 0;
          width: 2px;
          height: 100%;
          background: #705c48;
          transform: translateX(-50%);
          z-index: 10;
          opacity: 0.8;
        }
        .book-page-left, .book-page-right {
          position: absolute;
          width: 50%;
          height: 100%;
          top: 0;
          background: #fcfaf7;
          border: 1px solid rgba(112, 92, 72, 0.2);
          box-shadow: 0 4px 8px rgba(43, 39, 35, 0.05);
        }
        .book-page-left {
          left: 0;
          border-radius: 4px 0 0 4px;
          border-right: none;
        }
        .book-page-right {
          right: 0;
          border-radius: 0 4px 4px 0;
          border-left: none;
        }
        .book-page-flip {
          position: absolute;
          left: 50%;
          top: 0;
          width: 50%;
          height: 100%;
          background: #fcfaf7;
          border: 1px solid rgba(112, 92, 72, 0.2);
          border-left: none;
          border-radius: 0 4px 4px 0;
          transform-origin: left center;
          animation: bookFlip 1.5s infinite ease-in-out;
          z-index: 5;
          box-shadow: 0 4px 8px rgba(43, 39, 35, 0.05);
        }
        @keyframes bookFlip {
          0% {
            transform: rotateY(0deg);
            background: #fcfaf7;
          }
          50% {
            background: #e8e3d9;
          }
          100% {
            transform: rotateY(-180deg);
            background: #fcfaf7;
          }
        }
      `}</style>

      {/* Book animation */}
      <div className="book-container">
        <div className="book-spine"></div>
        <div className="book-page-left"></div>
        <div className="book-page-flip"></div>
        <div className="book-page-right"></div>
      </div>

      {/* Logo / Title */}
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.4em',
        color: '#705c48',
        textTransform: 'uppercase',
        marginBottom: '20px',
        fontFamily: "'Outfit', sans-serif",
        opacity: 0.85
      }}>
        JOURNAL
      </div>

      {/* Big percentage number */}
      <div style={{
        position: 'relative',
        marginBottom: '30px',
      }}>
        <span style={{
          fontSize: '90px',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontFamily: "'EB Garamond', serif",
          color: '#2b2723',
        }}>
          {String(pct).padStart(3, '0')}
        </span>
        <span style={{
          fontSize: '20px',
          fontWeight: 400,
          color: '#705c48',
          marginLeft: '4px',
          fontFamily: "'EB Garamond', serif",
          verticalAlign: 'top',
          lineHeight: '90px',
        }}>%</span>
      </div>

      {/* Progress bar container */}
      <div style={{
        width: '240px',
        position: 'relative',
        marginBottom: '25px',
      }}>
        {/* Track */}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'rgba(112, 92, 72, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '2px',
        }}>
          {/* Fill */}
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: '#705c48',
            transition: 'width 0.1s linear',
            position: 'relative',
            borderRadius: '2px',
          }} />
        </div>

        {/* Minimal Tick marks */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
        }}>
          {[0, 50, 100].map(tick => (
            <div key={tick} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                width: '1px',
                height: '4px',
                background: pct >= tick ? '#705c48' : 'rgba(112, 92, 72, 0.25)',
                transition: 'background 0.3s ease',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Status text */}
      <div style={{
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.15em',
        color: '#705c48',
        fontFamily: "'Outfit', sans-serif",
        textAlign: 'center',
        opacity: 0.9,
      }}>
        {loadingText}
      </div>

      {/* Decorative notebook edges */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '15px',
        height: '100%',
        background: 'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, transparent 100%)',
        borderRight: '1px dashed rgba(112, 92, 72, 0.15)',
      }} />
    </div>
  )
}

export default Loader
