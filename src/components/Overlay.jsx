import React, { useState, useEffect } from 'react'

const TECH_LOGOS = {
  "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "React.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "Go": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  "Go (Golang)": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  "Next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  "Elasticsearch": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elasticsearch/elasticsearch-original.svg",
  "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "HTML5": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  "CSS3": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  "JavaScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
  "Three.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg",
  "React Three Fiber": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "PHP": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  "GitHub": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  "RabbitMQ": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg",
  "SendGrid API": "https://cdn.simpleicons.org/sendgrid/1A82E2",
  "SendGrid": "https://cdn.simpleicons.org/sendgrid/1A82E2",
  "PromptPay QR": "https://cdn.simpleicons.org/promptpay/003764"
}

const getFallbackIcon = (tag) => {
  if (tag.includes('AI')) return '🤖'
  if (tag.includes('Webhook') || tag.includes('API')) return '⚡'
  if (tag.includes('Architecture')) return '🏗️'
  if (tag.includes('Search') || tag.includes('Data')) return '🔍'
  if (tag.includes('Lark') || tag.includes('Notify')) return '🔔'
  if (tag.includes('Streamer') || tag.includes('Tools')) return '🎙️'
  if (tag.includes('Payment')) return '💳'
  if (tag.includes('Task') || tag.includes('Board')) return '📋'
  if (tag.includes('Calendar')) return '📅'
  if (tag.includes('Dashboard') || tag.includes('Analytics')) return '📊'
  if (tag.includes('Graphics') || tag.includes('Animation')) return '✨'
  return '🛠️'
}

const PROJECTS_DICT = {
  donate_suku: {
    title: "Donate_Suku — ระบบโดเนทสำหรับสตรีมเมอร์ (Kupfae / Noipae)",
    description: "ระบบรับเงินสนับสนุน (Donation System) สำหรับสตรีมเมอร์และอินฟลูเอนเซอร์ พร้อมระบบ PromptPay QR Code อัตโนมัติ, แจ้งเตือนสตรีมสด (Alert Box), ตั้งเป้าหมายยอดโดเนท (Goal Bar), และแดชบอร์ดหลังบ้านจัดการข้อมูลครบวงจร",
    tags: ["Next.js", "Go (Golang)", "React", "PostgreSQL", "PromptPay QR", "Node.js"],
    link: "https://github.com/kunaaa123/Donate_Suku",
    role: "Full Stack Creator & Lead Developer",
    image: "/models/donate_suku_modal.jpg",
    shortName: "Donate_Suku"
  },
  todolist: {
    title: "DoneDay / TodoList — ระบบจัดการงานและตารางประจำวัน",
    description: "แอปพลิเคชันบริหารจัดการงานประจำวัน (Task Management App) พร้อมโมดูลแกนกลาง: ปฏิทิน (Calendar), ตารางเวลา (Schedule), บอร์ดติดตามงาน (Kanban Board), สถิติผู้ใช้ และการวางแผนภารกิจอย่างมีประสิทธิภาพ",
    tags: ["React", "JavaScript", "HTML5", "CSS3", "Node.js", "Task Manager"],
    link: "https://github.com/kunaaa123/TodoList",
    role: "Full Stack Creator & Lead Developer",
    image: "/models/todolist_modal.png",
    shortName: "TodoList"
  },
  ai_smart_event: {
    title: "AI_Smart_Event_Assistant — ระบบจัดการงานอีเวนต์อัจฉริยะด้วย AI",
    description: "แพลตฟอร์มผู้ช่วยจัดงานอีเวนต์อัจฉริยะ (Smart Event Platform) พร้อมฟีเจอร์ AI แนะนำสไตล์งาน, วางไทม์ไลน์, สร้างบัตรเชิญอัตโนมัติ, ระบบลงทะเบียนเข้างาน, แดชบอร์ดวิเคราะห์สถิติผู้ร่วมงาน และระบบจัดการอีเวนต์ครบวงจร",
    tags: ["React", "Go (Golang)", "Python", "MySQL", "SendGrid API", "AI Assistant"],
    link: "https://github.com/kunaaa123/AI_Smart_Event_Assistant",
    role: "Full Stack Creator & Lead Developer",
    image: "/models/ai_smart_event_modal.jpg",
    shortName: "AI_Smart_Event_Assistant"
  },
  elasticsearch: {
    title: "Elasticsearch Engine — ระบบค้นหาและวิเคราะห์ข้อมูลประสิทธิภาพสูง",
    description: "ระบบสืบค้นข้อมูลประสิทธิภาพสูง (Full-Text Search & Analytics Engine) รองรับการทำดัชนีข้อมูลเรียลไทม์ (Real-time Indexing), ค้นหาข้อความความเร็วสูง, ระบบคีย์เวิร์ดฟัซซี่ (Fuzzy Search), การกรองและวิเคราะห์ Big Data ซับซ้อน",
    tags: ["Elasticsearch", "Go (Golang)", "MySQL", "RabbitMQ", "Docker", "REST API"],
    link: "https://github.com/kunaaa123/Elasticsearch",
    role: "Backend & Data Architect",
    image: "/models/elasticsearch.jpg",
    shortName: "Elasticsearch"
  },
  sendgrid_webhook: {
    title: "SendGrid Webhook Event Service — ระบบจัดการ Email Events ด้วยภาษา Go",
    description: "บริการ Webhook ประสิทธิภาพสูงเขียนด้วยภาษา Go (Golang) โครงสร้าง Clean Hexagonal Architecture สำหรับรับและจัดการ Email Events จาก SendGrid (delivered, open, click, bounce ฯลฯ) พร้อมระบบตรวจสอบ Signature ECDSA อัตโนมัติ, บันทึกลง MySQL, ระบบ Logging และส่งแจ้งเตือนผ่าน Lark",
    tags: ["Go (Golang)", "SendGrid API", "MySQL", "Docker", "Hexagonal Architecture", "Lark Notify"],
    link: "https://github.com/kunaaa123/SendGrid_webhook",
    role: "Backend Engineer & System Architect",
    image: "/models/sendgrid_webhook.jpg",
    shortName: "SendGrid_webhook"
  },
  portfolio_3d: {
    title: "3D Interactive Web Portfolio — ผลงานเว็บไซต์ 3D โต้ตอบได้",
    description: "เว็บไซต์พอร์ตโฟลิโอ 3 มิติในรูปแบบแกลเลอรีจำลองสมุดบันทึกและห้องนิทรรศการ พัฒนาด้วย Three.js, React Three Fiber (R3F), GLSL Shader, Canvas Texture และการตอบสนองแบบ 3D Interactive เต็มรูปแบบ",
    tags: ["React", "Three.js", "React Three Fiber", "JavaScript", "HTML5", "Tailwind CSS"],
    link: "https://github.com/kunaaa123",
    role: "Full Stack 3D Developer & Architect",
    image: "/models/portfolio_3d_modal.jpg",
    shortName: "3D Portfolio"
  }
}

const getProjectForPaper = (paper) => {
  if (!paper) return PROJECTS_DICT.donate_suku
  if (paper.projectId && PROJECTS_DICT[paper.projectId]) {
    return PROJECTS_DICT[paper.projectId]
  }
  return PROJECTS_DICT.donate_suku
}

const Overlay = ({ hasClicked, focusedDoor, setFocusedDoor, selectedPaper, setSelectedPaper, cameraArrived, hoveredPaper }) => {
  const [showBanner, setShowBanner] = useState(true)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [hideScrollHint, setHideScrollHint] = useState(false)
  const [showContact, setShowContact] = useState(false)

  // Computer screen instruction banner states
  const [showComputerHint, setShowComputerHint] = useState(false)
  const [hasClickedScreen, setHasClickedScreen] = useState(false)
  const [hideComputerHint, setHideComputerHint] = useState(false)

  // Second room project papers instruction banner states
  const [showPaperHint, setShowPaperHint] = useState(false)
  const [hasClickedPaper, setHasClickedPaper] = useState(false)
  const [hidePaperHint, setHidePaperHint] = useState(false)

  // Third room contact screens instruction banner states
  const [showContactHint, setShowContactHint] = useState(false)
  const [hasClickedContactScreen, setHasClickedContactScreen] = useState(false)
  const [hideContactHint, setHideContactHint] = useState(false)

  // Detect actual mouse scroll
  useEffect(() => {
    if (!showScrollHint || hasScrolled) return

    const handleWheel = () => {
      setHasScrolled(true)
    }

    window.addEventListener('wheel', handleWheel, { once: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [showScrollHint, hasScrolled])

  // Fast-forward scroll hint fade out after scrolling
  useEffect(() => {
    if (hasScrolled) {
      const timer = setTimeout(() => {
        setHideScrollHint(true)
      }, 600) // fade out 0.6s after scrolling
      return () => clearTimeout(timer)
    }
  }, [hasScrolled])

  useEffect(() => {
    if (hasClicked) {
      // Hide the entrance status banner fast after 1.0s (was 3.5s)
      const timer1 = setTimeout(() => {
        setShowBanner(false)
      }, 1000)

      // Show the scroll hint immediately at 1.1s (was 4.5s)
      const timer2 = setTimeout(() => {
        setShowScrollHint(true)
      }, 1100)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [hasClicked])

  // Sync computer instruction banner states when camera enters/leaves the first room
  const isFirstRoom = focusedDoor && focusedDoor.x < 0 && focusedDoor.z > 30.0
  useEffect(() => {
    if (isFirstRoom && cameraArrived) {
      setShowComputerHint(true)
    } else {
      setShowComputerHint(false)
      setHasClickedScreen(false)
      setHideComputerHint(false)
    }
  }, [isFirstRoom, cameraArrived])

  // Detect when the user clicks the computer screen
  useEffect(() => {
    if (selectedPaper && selectedPaper.name === 'computer_screen') {
      setHasClickedScreen(true)
    }
  }, [selectedPaper])

  // Fade out first room screen banner 1.5s after clicking
  useEffect(() => {
    if (hasClickedScreen) {
      const timer = setTimeout(() => {
        setHideComputerHint(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasClickedScreen])

  // Sync project papers instruction banner states when camera enters/leaves the second room (Projects room)
  const isProjectRoom = focusedDoor && focusedDoor.x > 0 && Math.abs(focusedDoor.z - 4.9) < 10.0
  useEffect(() => {
    if (isProjectRoom && cameraArrived) {
      setShowPaperHint(true)
    } else {
      setShowPaperHint(false)
      setHasClickedPaper(false)
      setHidePaperHint(false)
    }
  }, [isProjectRoom, cameraArrived])

  // Detect when the user clicks on any project paper sheet in the second room
  useEffect(() => {
    if (selectedPaper && selectedPaper.name !== 'computer_screen') {
      setHasClickedPaper(true)
    }
  }, [selectedPaper])

  // Fade out second room papers banner 1.5s after clicking
  useEffect(() => {
    if (hasClickedPaper) {
      const timer = setTimeout(() => {
        setHidePaperHint(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasClickedPaper])

  // Sync contact screens instruction banner states when camera enters/leaves the third room (Contact room)
  const isThirdRoom = focusedDoor && focusedDoor.x < 0 && focusedDoor.z < -30.0
  useEffect(() => {
    if (isThirdRoom && cameraArrived) {
      setShowContactHint(true)
    } else {
      setShowContactHint(false)
      setHasClickedContactScreen(false)
      setHideContactHint(false)
    }
  }, [isThirdRoom, cameraArrived])

  // Detect when the user clicks on any contact screen in the third room
  useEffect(() => {
    if (selectedPaper && selectedPaper.name === 'contact_screen') {
      setHasClickedContactScreen(true)
    }
  }, [selectedPaper])

  // Fade out third room contact screen banner 1.5s after clicking
  useEffect(() => {
    if (hasClickedContactScreen) {
      const timer = setTimeout(() => {
        setHideContactHint(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasClickedContactScreen])

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

      {/* Banner 3: First room computer screen instruction */}
      {showComputerHint && (
        <div className={`overlay ${hideComputerHint ? 'hidden' : ''}`}>
          <div className="banner computer-banner">
            <h1 className="banner-title">INTERACT</h1>
            <div className="banner-content">
              {/* Screen / click pointer icon */}
              <svg className="click-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#705c48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <p className="banner-text">
                {hasClickedScreen ? 'เข้าสู่หน้าประวัติแล้ว!' : 'กดที่หน้าจอ'}
              </p>
              <div className={`checkbox-frame ${hasClickedScreen ? 'checked' : ''}`}>
                {hasClickedScreen && (
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

      {/* Banner 4: Second room project papers instruction */}
      {showPaperHint && (
        <div className={`overlay ${hidePaperHint ? 'hidden' : ''}`}>
          <div className="banner paper-banner">
            <h1 className="banner-title">INTERACT</h1>
            <div className="banner-content">
              {/* Paper / document icon */}
              <svg className="click-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#705c48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <p className="banner-text">
                {hasClickedPaper ? 'เปิดดูผลงานแล้ว!' : 'กดที่กระดาษ'}
              </p>
              <div className={`checkbox-frame ${hasClickedPaper ? 'checked' : ''}`}>
                {hasClickedPaper && (
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

      {/* Banner 5: Third room contact screens instruction */}
      {showContactHint && (
        <div className={`overlay ${hideContactHint ? 'hidden' : ''}`}>
          <div className="banner contact-banner">
            <h1 className="banner-title">INTERACT</h1>
            <div className="banner-content">
              {/* Screen / click icon */}
              <svg className="click-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#705c48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <p className="banner-text">
                {hasClickedContactScreen ? 'เปิดช่องทางติดต่อแล้ว!' : 'กดที่จอเพื่อเลือกช่องทางติดต่อ'}
              </p>
              <div className={`checkbox-frame ${hasClickedContactScreen ? 'checked' : ''}`}>
                {hasClickedContactScreen && (
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

      {/* Project Detail OR About Me OR Contact Channel Modal */}
      {selectedPaper && (
        <div className="project-modal-backdrop" onClick={() => setSelectedPaper(null)}>
          {selectedPaper.name === 'contact_screen' && selectedPaper.channel ? (
            selectedPaper.channel.id === 'cv' ? (
              /* Real CV Document PDF Viewer Modal */
              <div className="project-modal cv-document-modal" onClick={(e) => e.stopPropagation()}>
                <button className="project-modal-close" onClick={() => setSelectedPaper(null)} aria-label="Close">
                  &times;
                </button>

                <div className="cv-modal-header">
                  <span className="cv-modal-badge">📄 OFFICIAL RESUME DOCUMENT</span>
                  <h2 className="cv-modal-title">Singha Lakkham — Full Stack Developer Resume</h2>
                </div>

                <div className="cv-pdf-container">
                  <iframe
                    src="/models/singha_lakkham_resume.pdf#toolbar=1"
                    title="Singha Lakkham Resume PDF"
                    className="cv-pdf-iframe"
                  />
                </div>

                <div className="cv-modal-actions">
                  <a
                    href="/models/singha_lakkham_resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-action-btn primary"
                  >
                    <span>↗️ เปิดเอกสาร PDF ในหน้าต่างใหม่</span>
                  </a>
                  <a
                    href="/models/singha_lakkham_resume.pdf"
                    download="Singha_Lakkham_Resume.pdf"
                    className="cv-action-btn secondary"
                  >
                    <span>📥 ดาวน์โหลดไฟล์ PDF</span>
                  </a>
                  <button
                    className="cv-action-btn tertiary"
                    onClick={() => setSelectedPaper({ name: 'computer_screen' })}
                  >
                    <span>👨‍💻 ดูข้อมูลรูปแบบ 3D Profile Card</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Custom Beautiful Contact Channel Sheet */
              <div className="project-modal contact-channel-modal" onClick={(e) => e.stopPropagation()}>
                <button className="project-modal-close" onClick={() => setSelectedPaper(null)} aria-label="Close">
                  &times;
                </button>

                <div className="contact-notebook-container">
                  <div className="contact-header-stamp" style={{ borderColor: selectedPaper.channel.accentColor }}>
                    <span className="stamp-text">
                      OFFICIAL CONTACT
                    </span>
                  </div>

                  <div className="contact-main-layout">
                    <div className="contact-icon-large" style={{ background: selectedPaper.channel.brandColor || '#705c48', color: '#ffffff' }}>
                      <span>{selectedPaper.channel.icon || '📱'}</span>
                    </div>

                    <div className="contact-details-box">
                      <h2 className="contact-channel-title">{selectedPaper.channel.name}</h2>
                      <div className="contact-handle-badge">
                        {selectedPaper.channel.handle}
                      </div>
                      <p className="contact-channel-desc">
                        {selectedPaper.channel.desc}
                      </p>
                    </div>
                  </div>

                  <div className="contact-channel-actions">
                    <a
                      href={selectedPaper.channel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="channel-action-btn primary"
                      style={{ background: selectedPaper.channel.brandColor || '#705c48', textDecoration: 'none' }}
                    >
                      <span>🔗 เปิดไปยัง {selectedPaper.channel.name}</span>
                    </a>

                    <button
                      className="channel-action-btn secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPaper.channel.handle)
                        alert(`คัดลอกข้อความ "${selectedPaper.channel.handle}" เรียบร้อยแล้ว!`)
                      }}
                    >
                      <span>📋 คัดลอกข้อมูล ({selectedPaper.channel.handle})</span>
                    </button>
                  </div>

                  <div className="profile-signature-area">
                    <div className="signature-stamp">VERIFIED CHANNEL</div>
                    <div className="signature-handwritten">Kunaaa123</div>
                  </div>
                </div>
              </div>
            )
          ) : selectedPaper.name === 'computer_screen' ? (
            /* Custom Beautiful About Me Profile Sheet - Singha Lakkham Resume */
            <div className="project-modal profile-modal" onClick={(e) => e.stopPropagation()}>
              <button className="project-modal-close" onClick={() => setSelectedPaper(null)} aria-label="Close">
                &times;
              </button>
              
              <div className="profile-notebook-container">
                {/* Vintage Ink Stamp Emblem Header */}
                <div className="profile-header-stamp">
                  <span className="stamp-text">RESUME / CV</span>
                </div>

                <div className="profile-main-layout">
                  {/* Left Column: Portrait Photo & Personal Info */}
                  <div className="profile-left-col">
                    <div className="profile-photo-frame">
                      <img src="/models/profile_singha.jpg" alt="SINGHA LAKKHAM" className="profile-portrait-img" />
                      <div className="profile-photo-caption">SINGHA LAKKHAM</div>
                    </div>
                    
                    <div className="profile-meta-data">
                      <div className="meta-row">
                        <span className="meta-label">ชื่อ:</span>
                        <span className="meta-value">สิงหา หลักคำ</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">ตำแหน่ง:</span>
                        <span className="meta-value">Full Stack Developer</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">การศึกษา:</span>
                        <span className="meta-value">มรภ.เชียงราย (วิทยาการคอมฯ)</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">จบศึกษา:</span>
                        <span className="meta-value">มีนาคม 2026</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">โทรศัพท์:</span>
                        <span className="meta-value">0661571032</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">อีเมล:</span>
                        <span className="meta-value">singha20032546@gmail.com</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">ที่อยู่:</span>
                        <span className="meta-value">Chiang Rai, Thailand</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Work Experience, Projects & Skills */}
                  <div className="profile-right-col">
                    <div className="profile-header-titles">
                      <h1 className="profile-fullname">SINGHA LAKKHAM</h1>
                      <p className="profile-subtitle">FULL STACK DEVELOPER</p>
                    </div>

                    <h2 className="profile-section-title">💼 ประวัติการทำงาน (Work Experience)</h2>
                    <div className="profile-exp-list">
                      <div className="exp-item">
                        <div className="exp-header">
                          <span className="exp-role">Backend Developer (กรุงเทพ)</span>
                          <span className="exp-date">พ.ย. 2025 - มี.ค. 2026</span>
                        </div>
                        <div className="exp-company">บริษัท DIGIO (Thailand) Co., Ltd. (นักศึกษาฝึกงาน)</div>
                        <ul className="exp-bullet-list">
                          <li><strong>TAGTHAI Platform - Search Service Engine:</strong> พัฒนา REST API และระบบค้นหาข้อมูลประสิทธิภาพสูงด้วย Go (Gin) และ Elasticsearch</li>
                          <li>สร้างระบบเชื่อมต่อและซิงค์ข้อมูลแบบเรียลไทม์ระหว่าง MySQL และ Elasticsearch โดยใช้ RabbitMQ บน Docker Compose</li>
                        </ul>
                      </div>

                      <div className="exp-item">
                        <div className="exp-header">
                          <span className="exp-role">Backend Developer (เชียงใหม่)</span>
                          <span className="exp-date">เม.ย. 2025 - มิ.ย. 2025</span>
                        </div>
                        <div className="exp-company">บริษัท DIGIO (Thailand) Co., Ltd. (นักศึกษาฝึกงาน)</div>
                        <ul className="exp-bullet-list">
                          <li><strong>SendGrid Webhook Event Service:</strong> พัฒนาระบบ Backend ด้วยภาษา Go เพื่อรับ-ส่งและบันทึกสถานะอีเมลแบบเรียลไทม์ลง MySQL</li>
                          <li>ออกแบบโครงสร้างระบบ Clean Architecture และระบบความปลอดภัยในการรับข้อมูล พร้อมแจ้งเตือนผ่าน Lark Bot</li>
                        </ul>
                      </div>
                    </div>

                    <h2 className="profile-section-title">🚀 ผลงานและโปรเจกต์ (Projects)</h2>
                    <div className="profile-exp-list">
                      <div className="exp-item">
                        <div className="exp-header">
                          <span className="exp-role">Streamer Donation Platform (Kupfae Donate)</span>
                          <span className="exp-date">2026</span>
                        </div>
                        <ul className="exp-bullet-list">
                          <li>พัฒนา Real-time Widgets (Next.js, Go, SSE) สำหรับแสดงผลบน OBS และ TikTok Live</li>
                          <li>ทำระบบชำระเงินสแกน QR Code PromptPay และตรวจสอบสลิปอัตโนมัติ (PostgreSQL) พร้อมเสียงแจ้งเตือน TTS</li>
                        </ul>
                      </div>

                      <div className="exp-item">
                        <div className="exp-header">
                          <span className="exp-role">AI Smart Event Assistant</span>
                          <span className="exp-date">2025</span>
                        </div>
                        <ul className="exp-bullet-list">
                          <li>พัฒนาแพลตฟอร์มจัดการอีเวนต์ Full-stack ครบวงจรด้วย React, Go และ MySQL</li>
                          <li>สร้าง AI Microservice (Python, NLP) สำหรับแชตบอตอัจฉริยะ พร้อมผสาน Google Maps และ SendGrid</li>
                        </ul>
                      </div>
                    </div>

                    <h2 className="profile-section-title">🛠️ ทักษะและความเชี่ยวชาญ (Skills)</h2>
                    <div className="profile-skills-tags">
                      <span className="skill-badge highlight">Go (Golang)</span>
                      <span className="skill-badge highlight">React.js</span>
                      <span className="skill-badge highlight">Next.js</span>
                      <span className="skill-badge highlight">Node.js</span>
                      <span className="skill-badge">JavaScript</span>
                      <span className="skill-badge">HTML5/CSS3</span>
                      <span className="skill-badge">PHP</span>
                      <span className="skill-badge">Python (NLP)</span>
                      <span className="skill-badge highlight">MySQL</span>
                      <span className="skill-badge highlight">PostgreSQL</span>
                      <span className="skill-badge">Elasticsearch</span>
                      <span className="skill-badge">RabbitMQ</span>
                      <span className="skill-badge highlight">Docker</span>
                      <span className="skill-badge">GitHub</span>
                    </div>

                    <h2 className="profile-section-title">🌟 Soft Skills & Education</h2>
                    <div className="profile-skills-tags">
                      <span className="skill-badge soft">การเรียนรู้ไว</span>
                      <span className="skill-badge soft">การทำงานเป็นทีม</span>
                      <span className="skill-badge soft">การปรับตัว</span>
                      <span className="skill-badge soft">การสื่อสาร</span>
                      <span className="skill-badge soft">การจัดการเวลา</span>
                      <span className="skill-badge soft">การแก้ปัญหา</span>
                    </div>
                  </div>
                </div>

                {/* Handwritten Signature Stamp */}
                <div className="profile-signature-area">
                  <div className="signature-stamp">VERIFIED RESUME</div>
                  <div className="signature-handwritten">Singha Lakkham</div>
                </div>
              </div>
            </div>
          ) : (
            project && (
              <div className="project-modal" onClick={(e) => e.stopPropagation()}>
                <button className="project-modal-close" onClick={() => setSelectedPaper(null)} aria-label="Close">
                  &times;
                </button>
                <div className="project-modal-header">
                  <span className="project-role">{project.role}</span>
                  <h2 className="project-title">{project.title}</h2>
                </div>

                {project.image && (
                  <div className="project-modal-image-wrapper">
                    <img src={project.image} alt={project.title} className="project-modal-preview-img" />
                  </div>
                )}

                <div className="project-modal-body">
                  <p className="project-description">{project.description}</p>
                  
                  <div className="project-tech-section">
                    <h3 className="tech-section-title">🛠️ ภาษาและเทคโนโลยีที่ใช้พัฒนา</h3>
                    <div className="tech-logo-grid">
                      {project.tags.map((tag, i) => {
                        const logoUrl = TECH_LOGOS[tag]
                        return (
                          <div key={i} className="tech-logo-pill">
                            {logoUrl ? (
                              <img 
                                src={logoUrl} 
                                alt={tag} 
                                className="tech-badge-img" 
                                onError={(e) => { 
                                  e.target.style.display = 'none' 
                                  const parent = e.target.parentElement
                                  if (parent && !parent.querySelector('.tech-badge-emoji')) {
                                    const span = document.createElement('span')
                                    span.className = 'tech-badge-emoji'
                                    span.innerText = getFallbackIcon(tag)
                                    parent.insertBefore(span, parent.querySelector('.tech-badge-name'))
                                  }
                                }} 
                              />
                            ) : (
                              <span className="tech-badge-emoji">{getFallbackIcon(tag)}</span>
                            )}
                            <span className="tech-badge-name">{tag}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="project-modal-footer">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                    <span>ดูซอร์สโค้ดบน GitHub ({project.shortName || 'Project'})</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Top Right Actions Group */}
      {hasClicked && (
        <div className="top-right-actions">
          {/* Contact Button */}
          <button 
            className={`action-circle-btn ${showContact ? 'active' : ''}`}
            onClick={() => setShowContact(!showContact)}
            aria-label="Contact Information"
          >
            ✉️
          </button>
        </div>
      )}



      {/* Contact Envelope Card */}
      {showContact && (
        <div className="contact-card-wrapper">
          <div className="contact-card">
            <button className="contact-close" onClick={() => setShowContact(false)}>&times;</button>
            <h2 className="contact-title">CONTACT DETAILS</h2>
            <div className="contact-divider"></div>
            
            <div className="contact-content">
              <p className="contact-intro">ช่องทางการติดต่อและติดตามผลงานทั้งหมดของ Singha Lakkham:</p>
              
              <div className="contact-links">
                <a href="mailto:singha20032546@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <span className="contact-icon">📧</span>
                  <span className="contact-label">Email: singha20032546@gmail.com</span>
                </a>
                
                <a href="tel:0661571032" className="contact-link">
                  <span className="contact-icon">📞</span>
                  <span className="contact-label">Tel: 0661571032</span>
                </a>

                <a href="https://www.linkedin.com/in/singha-lakkham" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <span className="contact-icon">💼</span>
                  <span className="contact-label">LinkedIn: singha-lakkham</span>
                </a>

                <a href="https://www.instagram.com/singha_10_sk/" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <span className="contact-icon">📸</span>
                  <span className="contact-label">Instagram: @singha_10_sk</span>
                </a>

                <a href="https://www.facebook.com/sokun.oyo" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <span className="contact-icon">🌐</span>
                  <span className="contact-label">Facebook: sokun.oyo</span>
                </a>

                <a href="https://line.me/ti/p/gyc14Z3Zla" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <span className="contact-icon">💬</span>
                  <span className="contact-label">Line: gyc14Z3Zla</span>
                </a>

                <a href="https://github.com/kunaaa123" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <span className="contact-icon">💻</span>
                  <span className="contact-label">GitHub: github.com/kunaaa123</span>
                </a>
              </div>
            </div>
            
            <div className="contact-footer">
              — Singha Lakkham Portfolio
            </div>
          </div>
        </div>
      )}

      {/* Paper Mouse Hover Preview Tooltip */}
      {hoveredPaper && !selectedPaper && (
        <div
          className="paper-hover-preview"
          style={{
            left: `${Math.min(window.innerWidth - 250, hoveredPaper.x + 16)}px`,
            top: `${Math.min(window.innerHeight - 200, hoveredPaper.y + 16)}px`
          }}
        >
          <div className="hover-preview-thumb">
            <img src={hoveredPaper.image} alt={hoveredPaper.title} />
          </div>
          <div className="hover-preview-body">
            <h4 className="hover-preview-title">{hoveredPaper.title}</h4>
            <p className="hover-preview-desc">{hoveredPaper.desc}</p>
            <span className="hover-preview-hint">👉 คลิกที่กระดาษเพื่อเปิดดูรายละเอียด</span>
          </div>
        </div>
      )}
    </>
  )
}

export default Overlay
