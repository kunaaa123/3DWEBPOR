import { useGLTF, useAnimations, Html, useTexture } from '@react-three/drei'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Match entrance door — GLTFLoader may output "Object_13001" or "Object_13.001"
const isEntranceDoor = (name) => name === 'Object_13001' || name === 'Object_13.001'
const isExitDoor = (name) => name === 'Object_13'

// Unify all entrance door meshes and bone ancestors to prevent dead hitboxes
const isEntranceDoorMesh = (mesh) => {
  if (!mesh) return false
  if (isEntranceDoor(mesh.name)) return true

  let isEntrance = false
  mesh.traverseAncestors((ancestor) => {
    const name = ancestor.name ? ancestor.name.toLowerCase() : ''
    if (name.includes('entrance') || name.includes('doors_00') || name.includes('object_13.001') || name.includes('object_13001')) {
      isEntrance = true
    }
  })
  return isEntrance
}
// Unify all side door components (door panel, frame, sketch outlines, upper wall filler, and floating texts) into a single clickable hitbox
const isRoomDoorMesh = (name) => {
  if (!name || name.includes('entrance') || name.includes('exit')) return false
  const lower = name.toLowerCase()
  return lower.includes('door') ||
    lower.includes('frame') ||
    lower.includes('sketch') ||
    lower.includes('upper_wall_filler') ||
    lower.includes('text_') ||
    lower.includes('dev_') ||
    lower.includes('aboutme') ||
    lower.includes('project')
}



export const CONTACT_CHANNELS = {
  1: {
    id: 'ig',
    name: 'INSTAGRAM',
    handle: '@singha_10_sk',
    link: 'https://www.instagram.com/singha_10_sk/',
    icon: '📸',
    iconType: 'ig',
    bgColors: ['#833ab4', '#fd1d1d', '#fcb045'],
    brandColor: '#e1306c',
    glowColor: '#ff2a70',
    desc: 'ติดตามรูปภาพ สไตล์งาน และไลฟ์สไตล์ผู้พัฒนา Singha Lakkham (@singha_10_sk)'
  },
  2: {
    id: 'linkedin',
    name: 'LINKEDIN',
    handle: 'singha-lakkham',
    link: 'https://www.linkedin.com/in/singha-lakkham',
    icon: '💼',
    iconType: 'linkedin',
    bgColors: ['#00457c', '#0077b5', '#0096e6'],
    brandColor: '#0077b5',
    glowColor: '#00a0f0',
    desc: 'ดูประวัติการทำงาน การศึกษา และเครือข่ายวิชาชีพของ Singha Lakkham'
  },
  3: {
    id: 'gmail',
    name: 'GMAIL / EMAIL',
    handle: 'singha20032546@gmail.com',
    link: 'mailto:singha20032546@gmail.com',
    icon: '📧',
    iconType: 'gmail',
    bgColors: ['#a71d2a', '#ea4335', '#ff5252'],
    brandColor: '#ea4335',
    glowColor: '#ff3333',
    desc: 'ส่งอีเมลติดต่องาน พัฒนาระบบ หรือสอบถามข้อมูลเพิ่มเติม'
  },
  4: {
    id: 'phone',
    name: 'PHONE / TEL',
    handle: '0661571032',
    link: 'tel:0661571032',
    icon: '📞',
    iconType: 'phone',
    bgColors: ['#0f9d58', '#25d366', '#34a853'],
    brandColor: '#25d366',
    glowColor: '#00ff66',
    desc: 'สายตรงสำหรับติดต่อพูดคุยเรื่องงานและโปรเจกต์ (066-157-1032)'
  },
  5: {
    id: 'cv',
    name: 'CV / RESUME',
    handle: 'Singha Lakkham Resume',
    link: '#',
    icon: '📄',
    iconType: 'cv',
    bgColors: ['#b45309', '#f59e0b', '#fbbf24'],
    brandColor: '#d97706',
    glowColor: '#ffbb00',
    desc: 'เปิดอ่านเอกสาร Resume / CV ฉบับเต็มพร้อมรูปถ่ายและผลงาน'
  },
  6: {
    id: 'github',
    name: 'GITHUB',
    handle: 'github.com/kunaaa123',
    link: 'https://github.com/kunaaa123',
    icon: '💻',
    iconType: 'github',
    bgColors: ['#0d1117', '#21262d', '#30363d'],
    brandColor: '#24292e',
    glowColor: '#388bfd',
    desc: 'ดูคลังซอร์สโค้ด และผลงานพัฒนาซอฟต์แวร์บน GitHub'
  },
  7: {
    id: 'facebook',
    name: 'FACEBOOK',
    handle: 'sokun.oyo',
    link: 'https://www.facebook.com/sokun.oyo',
    icon: '🌐',
    iconType: 'facebook',
    bgColors: ['#084298', '#1877f2', '#3b82f6'],
    brandColor: '#1877f2',
    glowColor: '#4094ff',
    desc: 'ติดตามและส่งข้อความทักทายผ่าน Facebook Profile (sokun.oyo)'
  },
  8: {
    id: 'line',
    name: 'LINE CONTACT',
    handle: 'gyc14Z3Zla',
    link: 'https://line.me/ti/p/gyc14Z3Zla',
    icon: '💬',
    iconType: 'line',
    bgColors: ['#008000', '#00b900', '#00e600'],
    brandColor: '#00b900',
    glowColor: '#33ff33',
    desc: 'แอดไลน์เพื่อพูดคุยสอบถามและติดต่องานโดยตรงผ่าน Line'
  }
}

const drawBrandLogo = (ctx, type, cx, cy, size) => {
  ctx.save()
  ctx.translate(cx, cy)

  if (type === 'ig') {
    // Instagram Camera Logo
    const r = size * 0.42
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = size * 0.1
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(-r, -r, r * 2, r * 2, r * 0.35)
    else ctx.rect(-r, -r, r * 2, r * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(r * 0.48, -r * 0.48, r * 0.12, 0, Math.PI * 2)
    ctx.fill()
  } else if (type === 'linkedin') {
    // LinkedIn 'in' Logo
    const r = size * 0.42
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(-r, -r, r * 2, r * 2, r * 0.22)
    else ctx.rect(-r, -r, r * 2, r * 2)
    ctx.fill()

    ctx.fillStyle = '#0077b5'
    ctx.font = `bold ${Math.round(size * 0.72)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('in', r * 0.05, r * 0.05)
  } else if (type === 'gmail') {
    // Gmail Envelope Logo
    const w = size * 0.85
    const h = size * 0.6
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-w/2, -h/2, w, h)

    ctx.strokeStyle = '#ea4335'
    ctx.lineWidth = size * 0.1
    ctx.strokeRect(-w/2, -h/2, w, h)

    ctx.beginPath()
    ctx.moveTo(-w/2, -h/2)
    ctx.lineTo(0, 0)
    ctx.lineTo(w/2, -h/2)
    ctx.stroke()
  } else if (type === 'phone') {
    // Phone Call Logo
    const r = size * 0.45
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#25d366'
    ctx.font = `${Math.round(size * 0.5)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('📞', 0, 0)
  } else if (type === 'cv') {
    // CV Document Logo
    const w = size * 0.6
    const h = size * 0.8
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-w/2, -h/2, w, h)

    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(-w/2 + 8, -h/2 + 10, w - 16, 6)
    ctx.fillRect(-w/2 + 8, -h/2 + 20, w - 24, 4)
    ctx.fillRect(-w/2 + 8, -h/2 + 28, w - 16, 4)

    ctx.font = `bold ${Math.round(size * 0.32)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CV', 0, h/4)
  } else if (type === 'github') {
    // GitHub Laptop/Code Logo
    const r = size * 0.45
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#0d1117'
    ctx.font = `bold ${Math.round(size * 0.52)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('💻', 0, 0)
  } else if (type === 'facebook') {
    // Facebook 'f' Logo
    const r = size * 0.42
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(-r, -r, r * 2, r * 2, r * 0.22)
    else ctx.rect(-r, -r, r * 2, r * 2)
    ctx.fill()

    ctx.fillStyle = '#1877f2'
    ctx.font = `bold ${Math.round(size * 0.82)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('f', r * 0.15, r * 0.1)
  } else if (type === 'discord') {
    // Discord Controller Logo
    const r = size * 0.42
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(-r, -r * 0.8, r * 2, r * 1.6, r * 0.3)
    else ctx.rect(-r, -r * 0.8, r * 2, r * 1.6)
    ctx.fill()

    ctx.fillStyle = '#5865f2'
    ctx.beginPath()
    ctx.arc(-r * 0.35, -r * 0.1, r * 0.2, 0, Math.PI * 2)
    ctx.arc(r * 0.35, -r * 0.1, r * 0.2, 0, Math.PI * 2)
    ctx.fill()
  } else if (type === 'line') {
    // Line Bubble Logo
    const r = size * 0.42
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(-r, -r * 0.75, r * 2, r * 1.5, r * 0.35)
    else ctx.rect(-r, -r * 0.75, r * 2, r * 1.5)
    ctx.fill()

    ctx.fillStyle = '#00b900'
    ctx.font = `900 ${Math.round(size * 0.38)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('LINE', 0, 0)
  }

  ctx.restore()
}

// Normalize screen mesh UVs so 0..1 fills the display face without cropping or stretching from GLTF atlas
const normalizeMeshUVs = (mesh) => {
  if (!mesh.geometry || !mesh.geometry.attributes.uv) return
  mesh.geometry = mesh.geometry.clone()
  const uvAttr = mesh.geometry.attributes.uv

  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity
  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i)
    const v = uvAttr.getY(i)
    if (u < minU) minU = u
    if (u > maxU) maxU = u
    if (v < minV) minV = v
    if (v > maxV) maxV = v
  }

  const rangeU = maxU - minU
  const rangeV = maxV - minV

  if (rangeU > 0.001 && rangeV > 0.001) {
    for (let i = 0; i < uvAttr.count; i++) {
      const u = uvAttr.getX(i)
      const v = uvAttr.getY(i)
      const normU = (u - minU) / rangeU
      const normV = (v - minV) / rangeV
      uvAttr.setXY(i, normU, normV)
    }
    uvAttr.needsUpdate = true
  }
}

// Pull screen display mesh forward along surface normal to sit 100% flush on monitor display
const pullMeshForward = (mesh, distance = 0.003) => {
  if (!mesh.geometry || !mesh.geometry.attributes.position || !mesh.geometry.attributes.normal) return
  mesh.geometry = mesh.geometry.clone()
  const posAttr = mesh.geometry.attributes.position
  const normAttr = mesh.geometry.attributes.normal

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)
    const z = posAttr.getZ(i)

    const nx = normAttr.getX(i)
    const ny = normAttr.getY(i)
    const nz = normAttr.getZ(i)

    posAttr.setXYZ(i, x + nx * distance, y + ny * distance, z + nz * distance)
  }
  posAttr.needsUpdate = true
}

const SCREEN_CENTERS = [
  { num: 1, pos: new THREE.Vector3(-46.79, 9.95, -36.51) },
  { num: 2, pos: new THREE.Vector3(-35.11, 6.06, -38.20) },
  { num: 3, pos: new THREE.Vector3(-40.59, -1.28, -40.32) },
  { num: 4, pos: new THREE.Vector3(-44.40, 4.48, -44.25) },
  { num: 5, pos: new THREE.Vector3(-46.62, 1.53, -48.97) },
  { num: 6, pos: new THREE.Vector3(-51.50, 9.96, -51.12) },
  { num: 7, pos: new THREE.Vector3(-44.08, -2.00, -53.59) },
  { num: 8, pos: new THREE.Vector3(-39.42, 3.05, -57.33) },
  { num: 9, pos: new THREE.Vector3(-43.50, 9.97, -62.08) }
]

const getClosestScreenChannel = (clickPoint) => {
  let minDistance = Infinity
  let closestChannelNum = 1
  SCREEN_CENTERS.forEach(sc => {
    const dist = clickPoint.distanceTo(sc.pos)
    if (dist < minDistance) {
      minDistance = dist
      closestChannelNum = sc.num
    }
  })
  return CONTACT_CHANNELS[closestChannelNum] || CONTACT_CHANNELS[1]
}

const createContactScreenTexture = (channel) => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 384
  const ctx = canvas.getContext('2d')

  // Super Vibrant Gradient Background
  const colors = channel.bgColors || ['#1c1917', '#120f0e']
  const grad = ctx.createLinearGradient(0, 0, 512, 384)
  if (colors.length >= 3) {
    grad.addColorStop(0, colors[0])
    grad.addColorStop(0.5, colors[1])
    grad.addColorStop(1, colors[2])
  } else {
    grad.addColorStop(0, colors[0])
    grad.addColorStop(1, colors[1])
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 384)

  // Neon glowing outer border
  ctx.save()
  ctx.shadowColor = channel.glowColor || '#ffffff'
  ctx.shadowBlur = 15
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 8
  ctx.strokeRect(6, 6, 500, 372)
  ctx.restore()

  // Inner accent frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 2
  ctx.strokeRect(16, 16, 480, 352)

  // Top Category Badge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(24, 24, 140, 32, 6)
  else ctx.rect(24, 24, 140, 32)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚡ CONTACT', 94, 40)

  // Draw Real Brand Logo
  drawBrandLogo(ctx, channel.iconType, 256, 135, 85)

  // Channel Title
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 30px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
  ctx.shadowBlur = 8
  ctx.fillText(channel.name, 256, 218)
  ctx.shadowBlur = 0

  // Handle Pill Badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
  ctx.beginPath()
  const handleWidth = Math.max(200, ctx.measureText(channel.handle).width + 36)
  if (ctx.roundRect) ctx.roundRect(256 - handleWidth/2, 246, handleWidth, 34, 17)
  else ctx.rect(256 - handleWidth/2, 246, handleWidth, 34)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(channel.handle, 256, 263)

  // Bottom Click Action Button Graphic
  ctx.fillStyle = channel.glowColor || '#ffffff'
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(136, 302, 240, 42, 21)
  else ctx.rect(136, 302, 240, 42)
  ctx.fill()

  ctx.fillStyle = '#000000'
  ctx.font = '900 15px sans-serif'
  ctx.fillText('👉 CLICK TO CONNECT', 256, 323)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

// Format screenshot onto paper sheet filling 100% of the paper sheet (large, sharp, clear view)
const createProportionalPaperTexture = (imgElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 700
  const ctx = canvas.getContext('2d')

  if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
    const imgW = imgElement.naturalWidth
    const imgH = imgElement.naturalHeight

    // Cover-fit scale: Fill 100% of the paper sheet so details are large and clearly visible!
    const scale = Math.max(512 / imgW, 700 / imgH)
    const dw = imgW * scale
    const dh = imgH * scale
    const dx = (512 - dw) / 2
    const dy = (700 - dh) / 2

    // Enhance color saturation (+25%) and contrast (+8%) so all posters look vivid, punchy and clear!
    ctx.filter = 'saturate(1.25) contrast(1.08)'
    ctx.drawImage(imgElement, dx, dy, dw, dh)
    ctx.filter = 'none'
  } else {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 512, 700)
  }

  // Subtle clean paper border outline
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, 508, 696)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return texture
}



// Check if mesh is a paper/document sheet on the corkboard in Room 2
// Real mesh names: "Object0XX_Material_#1_0" with material "Material.012" at world x≈50
const isProjectPaperMesh = (node) => {
  if (!node || !node.isMesh) return false

  // Get world position — Room 2 corkboard papers are at x ≈ 50
  const wp = new THREE.Vector3()
  node.getWorldPosition(wp)
  if (wp.x < 40 || wp.x > 60) return false

  // Match paper sheet naming pattern: "ObjectXXX_Material_#1_0" with material "Material.012"
  const name = node.name || ''
  const matName = node.material ? (Array.isArray(node.material) ? node.material[0]?.name : node.material.name) : ''
  
  // Paper sheets use Material.012 and are named Object0XX_Material_#1_0
  if (matName === 'Material.012' && name.match(/^Object\d+_Material_#1_0$/)) {
    return true
  }

  return false
}

const isComputerPart = (node) => {
  if (!node) return false
  const selfName = node.name ? node.name.toLowerCase() : ''
  
  // Strict screen/monitor mesh matching: casing (computer front/back), screen glass (object_6), screen display (object_7)
  const isScreenMesh = selfName.includes('computer front') || 
                       selfName.includes('computer back') || 
                       selfName === 'object_6' || 
                       selfName.startsWith('object_7') ||
                       selfName.includes('screen') || 
                       selfName.includes('monitor')
                       
  return isScreenMesh
}


// Bones shared between entrance and exit doors that need to be deduplicated
const SHARED_BONE_NAMES = ['_rootJoint', 'Doors_00', 'Rdoor_01', 'Rdoor_end_03', 'Ldoor_02', 'Ldoor_end_04']
const ENTRANCE_SUFFIX = '_entrance'

// How far the door peeks open on hover (in seconds of animation time)
const NUDGE_PEEK_TIME = 8 / 24
const NUDGE_SPEED = 3

// Scroll-triggered animation configs
// How far (in Z units) from the text objects the animation begins
const TRIGGER_RADIUS = 18
// How far from exit door the animation begins
const EXIT_DOOR_TRIGGER_RADIUS = 40
// Lerp speed for scroll-triggered animations (lower = smoother/slower)
const SCROLL_ANIM_SPEED = 8

let corridorBlobPromise = null

const TOTAL_MODEL_BYTES = 91711632
const SPEED_TEST_ID = Date.now()
const CACHE_NAME = 'corridor-model-speedtest-' + SPEED_TEST_ID
const MODEL_URL = '/models/corridor.glb?speedTest=' + SPEED_TEST_ID

const fetchSingleModelWithProgress = async (url) => {
  // Clear any existing model caches first to ensure 100% fresh network download
  try {
    const keys = await caches.keys()
    for (const key of keys) {
      if (key.includes('corridor-model')) {
        await caches.delete(key)
      }
    }
  } catch (e) { /* ignore */ }

  const startTime = performance.now()
  console.log('⏱️ [Speed Test] Download started for 87.4MB model...')

  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Failed to load ${url}`)
  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : TOTAL_MODEL_BYTES
  const reader = response.body.getReader()
  const chunks = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    const pct = Math.min(85, Math.round((received / total) * 85))
    window.dispatchEvent(new CustomEvent('model-download-progress', { detail: pct }))
  }

  const durationSec = ((performance.now() - startTime) / 1000).toFixed(2)
  console.log(`⏱️ [Speed Test] Model download completed in ${durationSec} seconds!`)

  const result = new Uint8Array(received)
  let pos = 0
  for (const chunk of chunks) {
    result.set(chunk, pos)
    pos += chunk.length
  }

  return result.buffer
}

export const getCorridorBlobUrl = () => {
  if (!corridorBlobPromise) {
    corridorBlobPromise = fetchSingleModelWithProgress(MODEL_URL).then((buffer) => {
      const blob = new Blob([buffer], { type: 'model/gltf-binary' })
      window.dispatchEvent(new CustomEvent('model-download-progress', { detail: 85 }))
      return URL.createObjectURL(blob)
    })
  }
  return corridorBlobPromise
}

// Pre-trigger single model downloading immediately
getCorridorBlobUrl()

const Corridor = (props) => {
  const [modelUrl, setModelUrl] = useState(null)

  useEffect(() => {
    getCorridorBlobUrl().then(url => setModelUrl(url))
  }, [])

  if (!modelUrl) return null
  return <CorridorInner modelUrl={modelUrl} {...props} />
}

const CorridorInner = ({ modelUrl, onEntranceFound, onDoorClick, onCharacterFound, hasClicked, cameraZRef, onExitDoorFound, onRoomDoorsFound, onRoomDoorClick, cameraArrived, focusedDoor, doorOpenProgressRef, exitingDoorRef, exitPhaseRef, onPaperClick, selectedPaper, setHoveredPaper }) => {
  const { scene, animations } = useGLTF(modelUrl)
  const screenTexture = useTexture('/models/computer_screen.jpg')
  const sukuTexture = useTexture('/models/donate_suku.jpg')
  const todolistTexture = useTexture('/models/todolist.png')
  const aiEventTexture = useTexture('/models/ai_smart_event.png')
  const elasticsearchTexture = useTexture('/models/elasticsearch.jpg')
  const sendgridTexture = useTexture('/models/sendgrid_webhook.jpg')
  const portfolio3DTexture = useTexture('/models/portfolio_3d.png')
  const { gl, camera } = useThree()

  // Signal 92% when model + textures are loaded, then compile GPU shaders and signal 100%
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('model-download-progress', { detail: 92 }))
    
    // Compile GPU shaders for the actual loaded model
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => { if (m.map) gl.initTexture(m.map) })
        } else {
          if (child.material.map) gl.initTexture(child.material.map)
        }
      }
    })
    gl.compile(scene, camera)

    // Now the model is 100% GPU-ready
    window.dispatchEvent(new CustomEvent('model-download-progress', { detail: 100 }))
  }, [scene, gl, camera])
  useMemo(() => {
    screenTexture.flipY = false
    screenTexture.colorSpace = THREE.SRGBColorSpace
    sukuTexture.flipY = false
    sukuTexture.colorSpace = THREE.SRGBColorSpace
    todolistTexture.flipY = false
    todolistTexture.colorSpace = THREE.SRGBColorSpace
    aiEventTexture.flipY = false
    aiEventTexture.colorSpace = THREE.SRGBColorSpace
    elasticsearchTexture.flipY = false
    elasticsearchTexture.colorSpace = THREE.SRGBColorSpace
    sendgridTexture.flipY = false
    sendgridTexture.colorSpace = THREE.SRGBColorSpace
    portfolio3DTexture.flipY = false
    portfolio3DTexture.colorSpace = THREE.SRGBColorSpace
  }, [screenTexture, sukuTexture, todolistTexture, aiEventTexture, elasticsearchTexture, sendgridTexture, portfolio3DTexture])

  // --- Fix duplicate bone names BEFORE useAnimations creates the mixer ---
  // Rename entrance door bones to be unique, and remap their animation tracks
  const fixedAnimations = useMemo(() => {
    // Step 1: Find the entrance door mesh and its skeleton bones
    let entranceBoneNodes = new Set()
    scene.traverse((child) => {
      if (isEntranceDoor(child.name) && child.skeleton) {
        child.skeleton.bones.forEach(bone => {
          if (SHARED_BONE_NAMES.includes(bone.name)) {
            entranceBoneNodes.add(bone)
          }
        })
      }
    })

    // Step 2: Rename the entrance bones to be unique
    entranceBoneNodes.forEach(bone => {
      const newName = bone.name + ENTRANCE_SUFFIX
      console.log(`Renaming bone "${bone.name}" -> "${newName}"`)
      bone.name = newName
    })

    // Step 3: Clone and remap animation clips that target the entrance door
    return animations.map(clip => {
      if (clip.name !== 'Armature|Open.002') return clip

      // This is the entrance door clip — remap its track names
      const newTracks = clip.tracks.map(track => {
        const [boneName, ...propParts] = track.name.split('.')
        const propPath = propParts.join('.')

        if (SHARED_BONE_NAMES.includes(boneName)) {
          const newTrackName = boneName + ENTRANCE_SUFFIX + '.' + propPath
          console.log(`Remapping track "${track.name}" -> "${newTrackName}"`)
          const newTrack = track.clone()
          newTrack.name = newTrackName
          return newTrack
        }
        return track
      })

      return new THREE.AnimationClip(clip.name, clip.duration, newTracks, clip.blendMode)
    })
  }, [scene, animations])

  const { actions } = useAnimations(fixedAnimations, scene)
  const [hovered, setHovered] = useState(false)
  const doorRef = useRef()
  const entranceActionRef = useRef()
  const exitActionRef = useRef()
  const doorOpenedRef = useRef(false)  // immediate flag (not async like React state)
  const doorMeshesRef = useRef([])
  const sideDoorActionsRef = useRef([])  // { action, z, duration } for each side door clip

  // Refs for scroll-triggered text/dev animations
  const textRightActionRef = useRef()
  const textLeftActionRef = useRef()
  const devLeftActionRef = useRef()
  const devRightActionRef = useRef()
  const textWorldZRef = useRef(null)
  const exitDoorZRef = useRef(null)
  const initialCamZRef = useRef(null)
  const roomDoorsRef = useRef([])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    const isEntrance = isEntranceDoorMesh(e.object)
    if (isEntrance && onDoorClick && !doorOpenedRef.current) {
      console.log('--- OPENING ENTRANCE DOOR ---')
      doorOpenedRef.current = true  // immediately prevent nudge from interfering

      const targetAction = entranceActionRef.current

      if (targetAction) {
        console.log('Playing clip:', targetAction.getClip().name)
        targetAction.reset()
        targetAction.time = 1 / 24
        targetAction.paused = false
        targetAction.setLoop(THREE.LoopOnce)
        targetAction.clampWhenFinished = true
        targetAction.play()
      } else {
        console.warn('COULD NOT FIND ENTRANCE ANIMATION ACTION')
      }
      onDoorClick()
      return
    }

    // Detect click on any room door component
    if (hasClicked && isRoomDoorMesh(e.object.name)) {
      // Match to the nearest room door position based on the exact 3D click coordinate (e.point)
      const clickZ = e.point.z
      let nearestDoor = null
      let minZDist = Infinity

      roomDoorsRef.current.forEach((door) => {
        const zDist = Math.abs(clickZ - door.z)
        if (zDist < minZDist && zDist < 12) {
          minZDist = zDist
          nearestDoor = door
        }
      })

      if (nearestDoor && onRoomDoorClick) {
        console.log('[DOOR CLICK] Focusing door at Z:', nearestDoor.z.toFixed(2))
        onRoomDoorClick(nearestDoor)
      }
      return
    }

    // Detect click on papers inside the project room when camera has arrived inside
    // ONLY respond to papers that have project textures applied (isProjectPaperTarget === true)
    const isProjectRoom = focusedDoor && focusedDoor.x > 0 && Math.abs(focusedDoor.z - 4.9) < 10.0
    if (hasClicked && isProjectRoom && cameraArrived && e.object.userData.isProjectPaperTarget === true) {
      const wp = new THREE.Vector3()
      e.object.getWorldPosition(wp)
      console.log('[PAPER CLICK] ✅ Clicked textured paper:', e.object.name, 'Project:', e.object.userData.projectId)
      if (onPaperClick) {
        onPaperClick({
          name: e.object.name,
          position: wp,
          object: e.object,
          projectId: e.object.userData.projectId
        })
      }
    }

    // Detect click on computer in the first room when camera has arrived inside
    const isFirstRoom = focusedDoor && focusedDoor.x < 0 && focusedDoor.z > 30.0

    if (hasClicked && isFirstRoom && cameraArrived && isComputerPart(e.object)) {
      console.log('[COMPUTER CLICK] Clicked first room computer part:', e.object.name)
      if (onPaperClick) {
        onPaperClick({
          name: 'computer_screen',
          position: new THREE.Vector3(e.point.x, e.point.y, e.point.z),
          object: e.object
        })
      }
    }

    // Detect click on screens in the third room when camera has arrived inside
    const isThirdRoom = focusedDoor && focusedDoor.x < 0 && focusedDoor.z < -30.0

    if (hasClicked && isThirdRoom && cameraArrived) {
      const clickPoint = new THREE.Vector3(e.point.x, e.point.y, e.point.z)
      const channel = getClosestScreenChannel(clickPoint)
      console.log('[ROOM 3 SCREEN CLICKED SUCCESS] Channel:', channel.name, 'Clicked Point:', clickPoint)
      if (onPaperClick) {
        onPaperClick({
          name: 'contact_screen',
          channel: channel,
          position: clickPoint,
          object: e.object
        })
      }
    }
  }

  const doorActionRef = useRef()
  const nudgeTargetRef = useRef(1 / 24)  // target time for nudge (default = frame 1, closed)

  useFrame((state, delta) => {
    // Door peek/nudge on hover — smoothly animate the door open a crack
    // Skip if the door has been clicked (doorOpenedRef is immediate, hasClicked is async)
    if (!hasClicked && !doorOpenedRef.current && entranceActionRef.current) {
      const action = entranceActionRef.current
      const currentTime = action.time
      const target = nudgeTargetRef.current

      // Smoothly interpolate toward the target time
      const newTime = THREE.MathUtils.lerp(currentTime, target, 1 - Math.exp(-NUDGE_SPEED * delta))
      action.time = newTime
      action.paused = true  // keep it paused, we control time manually
    }

    // --- Scroll-triggered text/dev animations ---
    // Only activate after entry is complete and user starts scrolling
    if (hasClicked && cameraZRef?.current !== undefined && textWorldZRef.current !== null) {
      const camZ = cameraZRef.current
      const textZ = textWorldZRef.current

      // Record initial camera Z after entry (only once)
      if (initialCamZRef.current === null) {
        initialCamZRef.current = camZ
      }

      // Absolute distance from camera to text objects
      const absDist = Math.abs(camZ - textZ)

      // Progress: 0 = far away (closed), 1 = right at the text (fully open)
      const progress = THREE.MathUtils.clamp(
        1 - (absDist / TRIGGER_RADIUS),
        0, 1
      )
      // Smoothstep ease curve for natural motion
      const easedProgress = progress * progress * (3 - 2 * progress)

      // Helper to control an action pair (Zero stutter, pre-warmed actions)
      const controlActionPair = (actionA, actionB) => {
        if (!actionA || !actionB) return
        const clipDur = actionA.getClip().duration
        const targetTime = easedProgress * clipDur

        // Smoothly lerp toward target time
        actionA.time = THREE.MathUtils.lerp(actionA.time, targetTime, 1 - Math.exp(-SCROLL_ANIM_SPEED * delta))
        actionB.time = THREE.MathUtils.lerp(actionB.time, targetTime, 1 - Math.exp(-SCROLL_ANIM_SPEED * delta))
      }

      controlActionPair(textRightActionRef.current, textLeftActionRef.current)
      controlActionPair(devLeftActionRef.current, devRightActionRef.current)

      // --- Exit door: auto-open when camera approaches ---
      if (exitActionRef.current && exitDoorZRef.current !== null) {
        const exitAction = exitActionRef.current
        const exitZ = exitDoorZRef.current
        const exitDist = Math.abs(camZ - exitZ)
        const exitProgress = THREE.MathUtils.clamp(
          1 - (exitDist / EXIT_DOOR_TRIGGER_RADIUS),
          0, 1
        )
        const exitEased = exitProgress * exitProgress * (3 - 2 * exitProgress)
        const exitClipDur = exitAction.getClip().duration
        // Keep at frame 1 minimum to avoid mesh distortion
        const exitTargetTime = Math.max(1 / 24, exitEased * exitClipDur)

        if (!exitAction.isRunning || !exitAction.enabled) {
          exitAction.enabled = true
          exitAction.play()
          exitAction.paused = true
          exitAction.time = 1 / 24
        }
        exitAction.time = THREE.MathUtils.lerp(exitAction.time, exitTargetTime, 1 - Math.exp(-SCROLL_ANIM_SPEED * delta))
        exitAction.paused = true
      }

      // --- Side doors: scrub animation clips based on focus or exit state ---
      if (sideDoorActionsRef.current.length > 0) {
        const liveDoorOpenProgress = doorOpenProgressRef ? doorOpenProgressRef.current : 0
        const liveExitingDoor = exitingDoorRef ? exitingDoorRef.current : null
        const liveExitPhase = exitPhaseRef ? exitPhaseRef.current : 0

        sideDoorActionsRef.current.forEach(({ action, z, duration }) => {
          const isFocused = focusedDoor && Math.abs(z - focusedDoor.z) < 5
          const isExitingThisDoor = liveExitingDoor && Math.abs(z - liveExitingDoor.z) < 5

          if (isFocused) {
            // Map the door's opening directly to the smooth doorOpenProgress prop
            const targetTime = liveDoorOpenProgress * (duration / 2)
            action.time = THREE.MathUtils.lerp(action.time, targetTime, 1 - Math.exp(-10 * delta))
          } else if (isExitingThisDoor) {
            if (liveExitPhase === 1) {
              // Keep the door fully open while camera pulls back out
              action.time = THREE.MathUtils.lerp(action.time, duration / 2, 1 - Math.exp(-8 * delta))
            } else if (liveExitPhase === 2) {
              // Sync door closing with the doorOpenProgress prop during Phase 2
              const targetTime = liveDoorOpenProgress * (duration / 2)
              action.time = THREE.MathUtils.lerp(action.time, targetTime, 1 - Math.exp(-10 * delta))
            } else {
              action.time = THREE.MathUtils.lerp(action.time, 0, 1 - Math.exp(-6 * delta))
            }
          } else {
            // Smoothly close any unfocused doors
            action.time = THREE.MathUtils.lerp(action.time, 0, 1 - Math.exp(-4 * delta))
          }
          action.paused = true
        })
      }
    }
  })

  // Apply proportional project textures to paper sheets in Room 2
  // Donate_Suku → 3 sheets, TodoList → 2 sheets, AI_Smart_Event → 2 sheets, Elasticsearch → 2 sheets, SendGrid_webhook → 2 sheets, 3D Portfolio → 3 sheets
  const papersAppliedRef = useRef(false)
  useEffect(() => {
    if (!scene || !sukuTexture || !todolistTexture || !aiEventTexture || !elasticsearchTexture || !sendgridTexture || !portfolio3DTexture) return
    if (papersAppliedRef.current) return
    papersAppliedRef.current = true
    scene.updateMatrixWorld(true)

    const sukuPaperTex = createProportionalPaperTexture(sukuTexture.image)
    const todoPaperTex = createProportionalPaperTexture(todolistTexture.image)
    const aiEventPaperTex = createProportionalPaperTexture(aiEventTexture.image)
    const elasticPaperTex = createProportionalPaperTexture(elasticsearchTexture.image)
    const sendgridPaperTex = createProportionalPaperTexture(sendgridTexture.image)
    const portfolio3DPaperTex = createProportionalPaperTexture(portfolio3DTexture.image)

    let sukuCount = 0
    let todoCount = 0
    let aiEventCount = 0
    let elasticCount = 0
    let sendgridCount = 0
    let portCount = 0

    scene.traverse((child) => {
      if (child.isMesh && isProjectPaperMesh(child)) {
        // First 1 paper → Donate_Suku
        if (sukuCount < 1) {
          sukuCount++
          child.userData.isProjectPaperTarget = true
          child.userData.projectId = 'donate_suku'
          normalizeMeshUVs(child)
          pullMeshForward(child, 0.005)
          child.material = new THREE.MeshBasicMaterial({
            map: sukuPaperTex,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3,
            depthTest: true,
            depthWrite: true
          })
          child.material.needsUpdate = true
          child.renderOrder = 6
          console.log(`[ROOM 2 DONATE_SUKU #${sukuCount}] ✅ Applied paper: "${child.name}"`)
        }
        // Next 2 papers → TodoList
        else if (todoCount < 2) {
          todoCount++
          child.userData.isProjectPaperTarget = true
          child.userData.projectId = 'todolist'
          normalizeMeshUVs(child)
          pullMeshForward(child, 0.005)
          child.material = new THREE.MeshBasicMaterial({
            map: todoPaperTex,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3,
            depthTest: true,
            depthWrite: true
          })
          child.material.needsUpdate = true
          child.renderOrder = 6
          console.log(`[ROOM 2 TODOLIST #${todoCount}] ✅ Applied paper: "${child.name}"`)
        }
        // Next 2 papers → AI_Smart_Event_Assistant
        else if (aiEventCount < 2) {
          aiEventCount++
          child.userData.isProjectPaperTarget = true
          child.userData.projectId = 'ai_smart_event'
          normalizeMeshUVs(child)
          pullMeshForward(child, 0.005)
          child.material = new THREE.MeshBasicMaterial({
            map: aiEventPaperTex,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3,
            depthTest: true,
            depthWrite: true
          })
          child.material.needsUpdate = true
          child.renderOrder = 6
          console.log(`[ROOM 2 AI_SMART_EVENT #${aiEventCount}] ✅ Applied paper: "${child.name}"`)
        }
        // Next 2 papers → Elasticsearch
        else if (elasticCount < 2) {
          elasticCount++
          child.userData.isProjectPaperTarget = true
          child.userData.projectId = 'elasticsearch'
          normalizeMeshUVs(child)
          pullMeshForward(child, 0.005)
          child.material = new THREE.MeshBasicMaterial({
            map: elasticPaperTex,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3,
            depthTest: true,
            depthWrite: true
          })
          child.material.needsUpdate = true
          child.renderOrder = 6
          console.log(`[ROOM 2 ELASTICSEARCH #${elasticCount}] ✅ Applied paper: "${child.name}"`)
        }
        // Next 2 papers → SendGrid_webhook
        else if (sendgridCount < 2) {
          sendgridCount++
          child.userData.isProjectPaperTarget = true
          child.userData.projectId = 'sendgrid_webhook'
          normalizeMeshUVs(child)
          pullMeshForward(child, 0.005)
          child.material = new THREE.MeshBasicMaterial({
            map: sendgridPaperTex,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3,
            depthTest: true,
            depthWrite: true
          })
          child.material.needsUpdate = true
          child.renderOrder = 6
          console.log(`[ROOM 2 SENDGRID_WEBHOOK #${sendgridCount}] ✅ Applied paper: "${child.name}"`)
        }
        // Next 3 papers → 3D Interactive Portfolio
        else if (portCount < 3) {
          portCount++
          child.userData.isProjectPaperTarget = true
          child.userData.projectId = 'portfolio_3d'
          normalizeMeshUVs(child)
          pullMeshForward(child, 0.005)
          child.material = new THREE.MeshBasicMaterial({
            map: portfolio3DPaperTex,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -3,
            polygonOffsetUnits: -3,
            depthTest: true,
            depthWrite: true
          })
          child.material.needsUpdate = true
          child.renderOrder = 6
          console.log(`[ROOM 2 PORTFOLIO_3D #${portCount}] ✅ Applied paper: "${child.name}"`)
        }
      }
    })
    console.log(`[ROOM 2] Donate_Suku: ${sukuCount}, TodoList: ${todoCount}, AI_Smart_Event: ${aiEventCount}, Elasticsearch: ${elasticCount}, SendGrid_webhook: ${sendgridCount}, Portfolio_3D: ${portCount}`)
  }, [scene, sukuTexture, todolistTexture, aiEventTexture, elasticsearchTexture, sendgridTexture, portfolio3DTexture])

  useEffect(() => {
    console.log('--- ALL CORRIDOR GLB ANIMATION KEYS ---', Object.keys(actions))
    // --- Step 1: Identify all animations by clip name ---
    Object.keys(actions).forEach((key) => {
      const action = actions[key]
      const clip = action.getClip()

      const isBirdClip = clip.tracks.some(track =>
        track.name.toLowerCase().includes('robin') ||
        track.name.toLowerCase().includes('polysurface')
      )

      // Direct clip-name identification — most reliable approach
      let isEntranceAction = key === 'Armature|Open.002'
      let isExitAction = key === 'Armature|Open.001'

      if (isEntranceAction) {
        console.log('Found ENTRANCE action:', key)
        entranceActionRef.current = action
      }
      if (isExitAction) {
        console.log('Found EXIT action:', key)
        exitActionRef.current = action
      }

      // Text/DEV scroll-triggered animations
      if (key === 'Text_RightAction') {
        console.log('Found Text_Right action:', key)
        textRightActionRef.current = action
      }
      if (key === 'Text_LeftAction') {
        console.log('Found Text_Left action:', key)
        textLeftActionRef.current = action
      }
      if (key === 'DEV_LeftAction.001') {
        console.log('Found DEV_Left action:', key)
        devLeftActionRef.current = action
      }
      if (key === 'DEV_RightAction.001') {
        console.log('Found DEV_Right action:', key)
        devRightActionRef.current = action
      }

      // Identify side door clips — will be scrubbed on click
      const isSideDoorClip = key.startsWith('close /open') || key.startsWith('close/open')

      const isDoorClip = isEntranceAction || isExitAction
      const isTextDevClip = ['Text_RightAction', 'Text_LeftAction', 'DEV_LeftAction.001', 'DEV_RightAction.001'].includes(key)

      if (isBirdClip) {
        action.play()
      } else if (isTextDevClip) {
        // Pre-warm and pause at time=0 so scrubbing during scroll is 100% zero-stutter
        action.reset()
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        action.play().paused = true
        action.time = 0
        console.log('Setup scroll-triggered action:', key, 'duration:', clip.duration.toFixed(2) + 's')
      } else if (isSideDoorClip) {
        // Setup: paused at time=0 (door closed), will be scrubbed when clicked
        action.reset()
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        action.play().paused = true
        action.time = 0

        // Map this clip to its door's Z position by inspecting animation tracks
        const firstTrack = clip.tracks[0]
        if (firstTrack) {
          const nodeName = firstTrack.name.split('.')[0]
          const targetNode = scene.getObjectByName(nodeName)
          if (targetNode) {
            const wp = new THREE.Vector3()
            targetNode.getWorldPosition(wp)
            sideDoorActionsRef.current.push({ action, z: wp.z, duration: clip.duration })
            console.log(`[SIDE DOOR] Mapped "${key}" → node "${nodeName}" at Z:${wp.z.toFixed(1)}, duration:${clip.duration.toFixed(2)}s`)
          } else {
            console.warn(`[SIDE DOOR] Could not find node "${nodeName}" for clip "${key}"`)
          }
        }
      } else if (isDoorClip) {
        // Entrance/exit doors: start at frame 1 to avoid "lying down" mesh
        if (!hasClicked || isExitAction || action !== entranceActionRef.current) {
          action.reset()
          action.play().paused = true
          action.time = 1 / 24
        }
      } else {
        action.stop()
      }
    })

    // --- Step 2: Traverse and setup objects ---
    scene.updateMatrixWorld(true)
    const toRemove = []
    let projectPaperCount = 0

    scene.traverse((child) => {
      // Collect unwanted Pencil_Stroke_DEV objects for removal (not needed for web)
      if (child.name && child.name.includes('Pencil_Stroke_DEV')) {
        toRemove.push(child)
        return
      }


      if (child.isMesh || child.isSkinnedMesh) {
        const wp = new THREE.Vector3()
        child.getWorldPosition(wp)

        // Replace computer screen display textures
        const lowerName = child.name ? child.name.toLowerCase() : ''
        
        // Hide green glass overlays and CRT scanline meshes in Room 3 (e.g. Screen_0x.001 or green materials)
        const isGreenOverlayMesh = child.name && (
          (child.name.toLowerCase().includes('screen') && child.name.includes('.001')) ||
          child.name.toLowerCase().includes('green')
        )
        const matName = child.material ? (Array.isArray(child.material) ? child.material[0]?.name : child.material.name) : ''
        const isGreenMaterial = matName && (matName === 'Screen.001' || matName.includes('green'))

        if (isGreenOverlayMesh || isGreenMaterial) {
          console.log(`[HIDE GREEN OVERLAY] Hiding green screen glass overlay mesh: "${child.name}" (Mat: ${matName})`)
          child.visible = false
          return
        }

        // Room 3 Screens (Screen_01 to Screen_09 display meshes)
        const screenMatch = child.name ? child.name.match(/^Screen_0([1-9])$/i) : null
        if (screenMatch) {
          const num = parseInt(screenMatch[1], 10)
          const channel = CONTACT_CHANNELS[num]
          if (channel && child.material && !child.userData.setupComplete) {
            child.userData.setupComplete = true
            console.log(`[ROOM 3 SCREEN TEXTURE] Applying channel ${channel.name} to mesh: "${child.name}"`)
            normalizeMeshUVs(child)
            pullMeshForward(child, 0.003)
            const tex = createContactScreenTexture(channel)
            child.material = new THREE.MeshBasicMaterial({
              map: tex,
              side: THREE.DoubleSide,
              polygonOffset: true,
              polygonOffsetFactor: -2,
              polygonOffsetUnits: -2,
              depthTest: true,
              depthWrite: true
            })
            child.renderOrder = 5
          }
        } else if (child.name === 'Object_7003' || child.name === 'Object_7.003' || lowerName.includes('screen c')) {
          // Room 1 Computer screen
          if (!child.userData.setupComplete) {
            child.userData.setupComplete = true
            console.log(`[SCREEN TEXTURE REPLACE] Applying custom texture to mesh: "${child.name}"`)
            if (child.material) {
              child.material = child.material.clone()
              child.material.map = screenTexture
              child.material.needsUpdate = true
            }
          }
        } else if (isProjectPaperMesh(child)) {
          // Room 2 Project paper sheets - APPLY TO 3 PAPERS
          if (!child.userData.paperSetupDone) {
            child.userData.paperSetupDone = true
            if (projectPaperCount < 3) {
              projectPaperCount++
              child.userData.isProjectPaperTarget = true
              console.log(`[PROJECT PAPER TEXTURE #${projectPaperCount}] Applying Donate_Suku image to paper mesh: "${child.name}"`)
              normalizeMeshUVs(child)
              pullMeshForward(child, 0.005)
              child.material = new THREE.MeshBasicMaterial({
                map: sukuTexture,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: -3,
                polygonOffsetUnits: -3,
                depthTest: true,
                depthWrite: true
              })
              child.renderOrder = 6
            } else {
              child.userData.isProjectPaperTarget = false
            }
          }
        }
        // Double sided materials
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.side = THREE.DoubleSide)
        } else {
          child.material.side = THREE.DoubleSide
        }

        const inFirstRoom = wp.z > 30.0 && wp.x < 0

        if (inFirstRoom && child.name === 'Cube') {
          console.log(`[CUBE FIX] Found cube "${child.name}" in first room at world position:`, wp)
          const makeBlack = (mat) => {
            return new THREE.MeshBasicMaterial({
              color: new THREE.Color(0, 0, 0),
              transparent: false,
              opacity: 1,
              side: THREE.DoubleSide
            })
          }
          if (Array.isArray(child.material)) {
            child.material = child.material.map(m => makeBlack(m))
          } else {
            child.material = makeBlack(child.material)
          }
        }

        // Setup the entrance door
        if (isEntranceDoor(child.name)) {
          console.log('Found entrance door mesh:', child.name)
          doorRef.current = child
          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)
          onEntranceFound(worldPos, child.rotation)
        }

        // Setup the character target
        if (child.name === 'Object_2020' || child.name === 'Object_2.020') {
          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)
          if (onCharacterFound) onCharacterFound(worldPos)
        }

        // Discover Text_Right world Z position for scroll-triggered animations
        if (child.name === 'Text_Right') {
          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)
          textWorldZRef.current = worldPos.z
          console.log('Text_Right world Z:', worldPos.z.toFixed(2))
        }



        // Discover exit door world Z for auto-open
        if (isExitDoor(child.name)) {
          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)
          exitDoorZRef.current = worldPos.z
          console.log('Exit door world Z:', worldPos.z.toFixed(2))
          if (onExitDoorFound) onExitDoorFound(worldPos.z)
        }

        // Bird fixes
        if (child.name.toLowerCase().includes('robin') || child.name.includes('58')) {
          child.visible = true
          child.frustumCulled = false
          if (child.skeleton) {
            child.skeleton.calculateInverses()
          }
        }
      }
      // Fix character objects appearing black by forcing MeshBasicMaterial (unlit)
      const isCharacterMesh = ['Object_51', 'Object_48', 'Object_42', 'Object_39001'].includes(child.name)
      if (child.isMesh && isCharacterMesh) {
        if (child.material) {
          const makeBasic = (mat) => {
            const basicMat = new THREE.MeshBasicMaterial({
              map: mat.map,
              color: mat.color || new THREE.Color(1, 1, 1),
              transparent: mat.transparent,
              opacity: mat.opacity,
              side: THREE.DoubleSide
            })
            return basicMat
          }

          if (Array.isArray(child.material)) {
            child.material = child.material.map(m => makeBasic(m))
          } else {
            child.material = makeBasic(child.material)
          }
          console.log(`[MATERIAL FIX] Converted ${child.name} to MeshBasicMaterial`)
        }
      }
    })

    // --- Collect room door positions for head-turn effect ---
    const roomDoorPositions = []
    scene.traverse((child) => {
      if (child.name && child.name.includes('woodenDoor_01')) {
        let isEntranceOrExit = false
        child.traverse((c) => {
          if (isEntranceDoor(c.name) || isExitDoor(c.name)) isEntranceOrExit = true
        })
        if (!isEntranceOrExit) {
          const wp = new THREE.Vector3()
          child.getWorldPosition(wp)
          const exists = roomDoorPositions.some(d => Math.abs(d.z - wp.z) < 2)
          if (!exists) {
            roomDoorPositions.push({ x: wp.x, z: wp.z })
            console.log(`[DOOR DETECT] Room door "${child.name}" at X:${wp.x.toFixed(1)} Z:${wp.z.toFixed(1)}`)
          }
        }
      }
    })
    roomDoorsRef.current = roomDoorPositions
    if (onRoomDoorsFound) onRoomDoorsFound(roomDoorPositions)

    // Remove collected objects safely after traversal
    toRemove.forEach((obj) => {
      obj.visible = false
      if (obj.parent) obj.parent.remove(obj)
    })
  }, [scene, actions, onEntranceFound])

  return (
    <>
      <primitive
        object={scene}
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => {
          e.stopPropagation()
          const isEntrance = isEntranceDoorMesh(e.object)

          if (isEntrance && !hasClicked) {
            setHovered(true)
            document.body.style.cursor = 'pointer'
            nudgeTargetRef.current = NUDGE_PEEK_TIME
          }

          if (hasClicked && isRoomDoorMesh(e.object.name)) {
            document.body.style.cursor = 'pointer'
          }

          // Show pointer cursor & hover tooltip for project papers
          const isProjectRoom = focusedDoor && focusedDoor.x > 0 && Math.abs(focusedDoor.z - 4.9) < 10.0
          if (hasClicked && isProjectRoom && cameraArrived && e.object.userData.isProjectPaperTarget) {
            document.body.style.cursor = 'pointer'
            
            if (setHoveredPaper) {
              const pid = e.object.userData.projectId || 'donate_suku'
              const info = pid === 'todolist' 
                ? { title: 'TodoList (DoneDay) — ระบบจัดการงาน', desc: 'ปฏิทิน ตารางเวลา และสถิติประจำวัน', image: '/models/todolist_modal.png' }
                : pid === 'ai_smart_event'
                ? { title: 'AI_Smart_Event_Assistant — ระบบอีเวนต์ AI', desc: 'ระบบผู้ช่วยจัดงานอีเวนต์ สร้างบัตรเชิญ และวิเคราะห์สถิติ', image: '/models/ai_smart_event_modal.jpg' }
                : pid === 'elasticsearch'
                ? { title: 'Elasticsearch Engine — ระบบค้นหาข้อมูล', desc: 'ระบบสืบค้นข้อมูลประสิทธิภาพสูง และวิเคราะห์ Big Data', image: '/models/elasticsearch.jpg' }
                : pid === 'sendgrid_webhook'
                ? { title: 'SendGrid Webhook Service — Go Backend', desc: 'บริการรับจัดการ Email Events, Signature Audit & MySQL', image: '/models/sendgrid_webhook.jpg' }
                : pid === 'portfolio_3d'
                ? { title: '3D Interactive Portfolio — I\'m Singha', desc: 'พอร์ตโฟลิโอ 3 มิติเชิงโต้ตอบ Three.js & React Three Fiber', image: '/models/portfolio_3d_modal.jpg' }
                : { title: 'Donate_Suku — ระบบโดเนท', desc: 'ระบบ PromptPay & Alert Box สตรีมเมอร์', image: '/models/donate_suku_modal.jpg' }

              setHoveredPaper({
                x: e.clientX,
                y: e.clientY,
                projectId: pid,
                ...info
              })
            }
          }

          // Show pointer cursor for computer in the first room
          const isFirstRoom = focusedDoor && focusedDoor.x < 0 && focusedDoor.z > 30.0
          if (hasClicked && isFirstRoom && cameraArrived && isComputerPart(e.object)) {
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerMove={(e) => {
          const isProjectRoom = focusedDoor && focusedDoor.x > 0 && Math.abs(focusedDoor.z - 4.9) < 10.0
          if (hasClicked && isProjectRoom && cameraArrived && e.object.userData.isProjectPaperTarget && setHoveredPaper) {
            const pid = e.object.userData.projectId || 'donate_suku'
            const info = pid === 'todolist' 
              ? { title: 'TodoList (DoneDay) — ระบบจัดการงาน', desc: 'ปฏิทิน ตารางเวลา และสถิติประจำวัน', image: '/models/todolist_modal.png' }
              : pid === 'ai_smart_event'
              ? { title: 'AI_Smart_Event_Assistant — ระบบอีเวนต์ AI', desc: 'ระบบผู้ช่วยจัดงานอีเวนต์ สร้างบัตรเชิญ และวิเคราะห์สถิติ', image: '/models/ai_smart_event_modal.jpg' }
              : pid === 'elasticsearch'
              ? { title: 'Elasticsearch Engine — ระบบค้นหาข้อมูล', desc: 'ระบบสืบค้นข้อมูลประสิทธิภาพสูง และวิเคราะห์ Big Data', image: '/models/elasticsearch.jpg' }
              : pid === 'sendgrid_webhook'
              ? { title: 'SendGrid Webhook Service — Go Backend', desc: 'บริการรับจัดการ Email Events, Signature Audit & MySQL', image: '/models/sendgrid_webhook.jpg' }
              : pid === 'portfolio_3d'
              ? { title: '3D Interactive Portfolio — I\'m Singha', desc: 'พอร์ตโฟลิโอ 3 มิติเชิงโต้ตอบ Three.js & React Three Fiber', image: '/models/portfolio_3d_modal.jpg' }
              : { title: 'Donate_Suku — ระบบโดเนท', desc: 'ระบบ PromptPay & Alert Box สตรีมเมอร์', image: '/models/donate_suku_modal.jpg' }

            setHoveredPaper({
              x: e.clientX,
              y: e.clientY,
              projectId: pid,
              ...info
            })
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          const isEntrance = isEntranceDoorMesh(e.object)

          if (isEntrance && !hasClicked) {
            setHovered(false)
            document.body.style.cursor = 'auto'
            nudgeTargetRef.current = 1 / 24
          }

          if (hasClicked && isRoomDoorMesh(e.object.name)) {
            document.body.style.cursor = 'auto'
          }

          // Reset cursor & tooltip when leaving project papers
          const isProjectRoom = focusedDoor && focusedDoor.x > 0 && Math.abs(focusedDoor.z - 4.9) < 10.0
          if (hasClicked && isProjectRoom && cameraArrived && (e.object.userData.isProjectPaperTarget || isProjectPaperMesh(e.object))) {
            document.body.style.cursor = 'auto'
            if (setHoveredPaper) setHoveredPaper(null)
          }

          // Reset cursor when leaving computer
          const isFirstRoom = focusedDoor && focusedDoor.x < 0 && focusedDoor.z > 30.0
          if (hasClicked && isFirstRoom && cameraArrived && isComputerPart(e.object)) {
            document.body.style.cursor = 'auto'
          }
        }}
      />

    </>
  )
}

useTexture.preload('/models/computer_screen.jpg')
useTexture.preload('/models/donate_suku.jpg')
useTexture.preload('/models/todolist.png')
useTexture.preload('/models/ai_smart_event.png')
useTexture.preload('/models/elasticsearch.jpg')
useTexture.preload('/models/sendgrid_webhook.jpg')
useTexture.preload('/models/donate_suku_modal.jpg')
useTexture.preload('/models/portfolio_3d.png')

export default Corridor
