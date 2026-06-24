import React, { useState, useEffect } from 'react'

const PROJECTS_DATA = [
  {
    title: "Project Alpha: 3D Interactive Corridor",
    description: "โชว์เคสทางเดิน 3 มิติเชิงโต้ตอบที่สร้างด้วย React, Three.js, และ @react-three/fiber โดยเน้นความลื่นไหลในการเคลื่อนที่ของกล้องและการจัดการโมเดลขนาดใหญ่",
    tags: ["React", "Three.js", "R3F", "GLSL Shaders"],
    link: "https://github.com",
    role: "Lead 3D Developer"
  },
  {
    title: "Project Beta: WebGL Game Hub",
    description: "แพลตฟอร์มศูนย์รวมเกมบนเว็บเบราว์เซอร์ที่รองรับกราฟิกสามมิติและการเชื่อมต่อผู้เล่นพร้อมกันแบบเรียลไทม์ผ่าน WebSockets",
    tags: ["WebGL", "WebSockets", "Node.js", "Tailwind CSS"],
    link: "https://github.com",
    role: "Full Stack Engineer"
  },
  {
    title: "Project Gamma: Creative VR Experience",
    description: "ระบบจำลองสภาพแวดล้อมเสมือนจริง (VR) ผ่านเบราว์เซอร์ที่เปิดให้ผู้ใช้งานได้ท่องเที่ยวในแกลเลอรีศิลปะดิจิทัลของศิลปินไทย",
    tags: ["WebXR", "A-Frame", "React", "Blender"],
    link: "https://github.com",
    role: "Technical Artist"
  }
]

const getProjectForPaper = (paper) => {
  if (!paper) return PROJECTS_DATA[0]

  // Extract number from name if exists, or use Z position
  const name = paper.name || ""
  const match = name.match(/\d+/)
  if (match) {
    const idx = parseInt(match[0], 10) % PROJECTS_DATA.length
    return PROJECTS_DATA[idx]
  }

  // Otherwise, use Z position to split
  const z = paper.position ? paper.position.z : 4.9
  if (z > 6.0) return PROJECTS_DATA[0]
  if (z > 3.0) return PROJECTS_DATA[1]
  return PROJECTS_DATA[2]
}

const Overlay = ({ hasClicked, focusedDoor, setFocusedDoor, selectedPaper, setSelectedPaper }) => {
  const [showBanner, setShowBanner] = useState(true)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [hideScrollHint, setHideScrollHint] = useState(false)

  // Detect actual mouse scroll
  useEffect(() => {
    if (!showScrollHint || hasScrolled) return

    const handleWheel = () => {
      setHasScrolled(true)
    }

    window.addEventListener('wheel', handleWheel, { once: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [showScrollHint, hasScrolled])

  // After scrolled → show checkmark briefly, then fade out
  useEffect(() => {
    if (hasScrolled) {
      const timer = setTimeout(() => {
        setHideScrollHint(true)
      }, 1500) // fade out 1.5s after scrolling
      return () => clearTimeout(timer)
    }
  }, [hasScrolled])

  useEffect(() => {
    if (hasClicked) {
      // Hide the entrance banner after 3.5s
      const timer1 = setTimeout(() => {
        setShowBanner(false)
      }, 3500)

      // Show the scroll hint after entrance banner fades (4.5s)
      const timer2 = setTimeout(() => {
        setShowScrollHint(true)
      }, 4500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [hasClicked])

  const handleExitRoom = () => {
    if (setFocusedDoor) {
      setFocusedDoor(null)
    }
    if (setSelectedPaper) {
      setSelectedPaper(null)
    }
  }

  const project = selectedPaper ? getProjectForPaper(selectedPaper) : null

  return (
    <>
      {/* Banner 1: Entrance door */}
      <div className={`overlay ${!showBanner ? 'hidden' : ''}`}>
        <div className="banner">
          <h1 className="banner-title">EXPLORER</h1>
          <div className="banner-content">
            <p className="banner-text">
              {hasClicked ? 'กำลังเข้าสู่ห้องโถง...' : 'กดที่ประตูเพื่อดู Portfolio'}
            </p>
            <div className={`checkbox-frame ${hasClicked ? 'checked' : ''}`}>
              {hasClicked && (
                <svg viewBox="0 0 24 24" className="checkmark-svg">
                  <path
                    d="M4 12l6 6L20 6"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner 2: Scroll instruction */}
      {showScrollHint && (
        <div className={`overlay ${hideScrollHint ? 'hidden' : ''}`}>
          <div className="banner scroll-banner">
            <h1 className="banner-title">NAVIGATE</h1>
            <div className="banner-content">
              {/* Mouse scroll icon */}
              <svg className="scroll-icon" viewBox="0 0 24 40" width="20" height="33">
                <rect x="4" y="1" width="16" height="28" rx="8" ry="8"
                  fill="none" stroke="#c0c0c0" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="14"
                  stroke="#c0c0c0" strokeWidth="2" strokeLinecap="round"
                  className="scroll-line" />
                {/* Down arrows */}
                <polyline points="8,32 12,36 16,32"
                  fill="none" stroke="#c0c0c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="scroll-arrow" />
              </svg>
              <p className="banner-text">
                {hasScrolled ? 'เริ่มสำรวจได้เลย!' : 'สกรอลเมาส์เพื่อสำรวจ'}
              </p>
              <div className={`checkbox-frame ${hasScrolled ? 'checked' : ''}`}>
                {hasScrolled && (
                  <svg viewBox="0 0 24 24" className="checkmark-svg">
                    <path
                      d="M4 12l6 6L20 6"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit room button — shown when user is focused on a room door and NOT viewing a paper */}
      <div className={`exit-room-overlay ${focusedDoor && !selectedPaper ? 'visible' : ''}`}>
        <button className="exit-room-btn" onClick={handleExitRoom} id="exit-room-button">
          <div className="exit-btn-glow"></div>
          <div className="exit-btn-content">
            <svg className="exit-arrow" viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M19 12H5M5 12l5-5M5 12l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="exit-text">กลับสู่ห้องโถง</span>
            <span className="exit-kbd">ESC</span>
          </div>
        </button>
      </div>

      {/* Project Detail Modal */}
      {selectedPaper && project && (
        <div className="project-modal-backdrop" onClick={() => setSelectedPaper(null)}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button className="project-modal-close" onClick={() => setSelectedPaper(null)} aria-label="Close">
              &times;
            </button>
            <div className="project-modal-header">
              <span className="project-role">{project.role}</span>
              <h2 className="project-title">{project.title}</h2>
            </div>
            <div className="project-modal-body">
              <p className="project-description">{project.description}</p>
              <div className="project-tags">
                {project.tags.map((tag, i) => (
                  <span key={i} className="project-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="project-modal-footer">
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                <span>ดูผลงานโปรเจกต์</span>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Overlay
