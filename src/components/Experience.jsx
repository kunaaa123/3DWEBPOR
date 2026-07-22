import { useScroll, PerspectiveCamera, Environment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import Corridor from './Corridor'

// Duration of the cinematic entry through the door (seconds)
const ENTRY_DURATION = 2.5
// How far past the door the entry animation ends (in Z units)
const ENTRY_DEPTH = 25
// Mouse parallax — how much the camera look-at shifts with mouse movement
const MOUSE_PARALLAX_X = 2.5   // max horizontal offset at 15 units distance
const MOUSE_PARALLAX_Y = 1.5   // max vertical offset at 15 units distance
const MOUSE_LERP_SPEED = 3    // smoothing speed

// Auto head-turn — camera turns toward nearest door when scrolling past it
const HEAD_TURN_RADIUS = 45   // Z-distance to trigger head-turn (longer range)
const HEAD_TURN_MAX_X = 5.5   // max lookAt X offset toward door at 15 units distance
const HEAD_TURN_LERP = 2.5    // smoothing speed

// Room door cinematic speeds
const DOOR_OPEN_SPEED = 1.4      // how fast the door opens (lower = slower/more realistic)
const DIVE_SPEED = 1.5           // how fast camera dives into room (snappy and responsive)
const DIVE_THRESHOLD = 0.55      // door open progress before camera starts diving in (seamless transition)
const EXIT_PULLBACK_SPEED = 3.6   // how fast camera pulls back out during exit (fast and snappy)
const EXIT_DOOR_CLOSE_SPEED = 2.5 // how fast door closes after camera is out
const EXIT_RETURN_SPEED = 2.8     // how fast camera returns to corridor after door closes

const getRoomDiveParameters = (door) => {
  if (!door) return { endX: 12.5, lookX: 25.0 };
  const isLeft = door.x < 0;
  
  // Identify the FIRST room: Left side (x < 0) and Z is near 58.85 (e.g. Z > 30.0)
  const isFirstRoom = isLeft && door.z > 30.0;
  
  // Identify the THIRD room (Computer screen room): Left side (x < 0) and Z is near -45.28 (e.g. Z < -30.0)
  const isThirdRoom = isLeft && door.z < -30.0;
  
  // Identify PROJECT room: Right side (x > 0) and Z is near 4.9
  const isProjectRoom = !isLeft && Math.abs(door.z - 4.9) < 10.0;
  
  if (isFirstRoom) {
    return {
      endX: -14.0, // Shallower dive to prevent over-zooming/clipping in first room
      lookX: -30.0 // Adjusted look target
    };
  } else if (isThirdRoom) {
    return {
      endX: -22.0, // Move camera in further to center the wall of screens
      lookX: -46.0 // Look directly at the computer screen wall (at X = -47)
    };
  } else if (isProjectRoom) {
    return {
      endX: 34.0, // Dive slightly shallower than 39.5
      lookX: 52.0, // Look target
      speed: 2.5,  // Faster dive speed to compensate for longer distance (38.5 units)
      exitSpeed: 5.2 // Faster exit pullback speed to compensate for longer distance
    };
  } else {
    return {
      endX: isLeft ? -28.0 : 28.0, // Standard room dive
      lookX: isLeft ? -44.0 : 44.0
    };
  }
};

const Experience = ({ onDoorClick, onReady, hasClicked, focusedDoor, setFocusedDoor, selectedPaper, setSelectedPaper, cameraArrived, setCameraArrived, setHoveredPaper }) => {
  const scroll = useScroll()
  const cameraRef = useRef()
  const [targetPos, setTargetPos] = useState(null)
  const [targetLookAt, setTargetLookAt] = useState(new THREE.Vector3(0, 1.6, -10))
  const [doorPos, setDoorPos] = useState(null)
  const [charPos, setCharPos] = useState(null)
  const [exitDoorZ, setExitDoorZ] = useState(null)
  const [roomDoors, setRoomDoors] = useState([])  // [{ x, z }] room door positions

  // Track entry animation progress
  const entryProgressRef = useRef(0)       // 0 = at door, 1 = entry complete
  const entryCompleteRef = useRef(false)
  const clickTimeRef = useRef(null)
  const cameraZRef = useRef(0)             // track camera world Z for scroll-triggered anims
  const teleportCooldown = useRef(0)       // frames to ignore scroll after teleport

  // Mouse parallax
  const mouseRef = useRef({ x: 0, y: 0 })        // raw mouse (-1 to 1)
  const smoothMouseRef = useRef({ x: 0, y: 0 })  // smoothed mouse
  const headTurnRef = useRef(0)                    // current head-turn X offset

  // Ref tracking focused side door to prevent frame lag during click transitions
  const focusedDoorRef = useRef(null)
  const entranceInitializedRef = useRef(false)
  const doorOpenProgressRef = useRef(0)
  const diveProgressRef = useRef(0)
  const cameraArrivedAtDoorRef = useRef(false)



  // === EXIT ANIMATION STATE ===
  // Instead of immediately clearing focusedDoor, we track the exit in phases:
  //   Phase 0: not exiting
  //   Phase 1: camera pulls back out of the room through the doorway
  //   Phase 2: door closes
  //   Phase 3: camera glides back to corridor scroll position (then done)
  const exitingDoorRef = useRef(null)     // the door we are exiting from
  const exitPhaseRef = useRef(0)          // 0 = not exiting

  // Pre-allocated working vectors — eliminates ~15 allocations per frame
  const _targetP = useMemo(() => new THREE.Vector3(), [])
  const _targetL = useMemo(() => new THREE.Vector3(), [])
  const _lookAtVec = useMemo(() => new THREE.Vector3(), [])
  const _entryPos = useMemo(() => new THREE.Vector3(), [])

  const onCharacterFound = useCallback((pos) => {
    setCharPos(pos)
  }, [])

  const onExitDoorFound = useCallback((z) => {
    setExitDoorZ(z)
    console.log('Experience received exit door Z:', z.toFixed(2))
  }, [])

  // Use useCallback to prevent infinite loop
  const onEntranceFound = useCallback((pos, rotation) => {
    setDoorPos(pos.clone())

    if (!entranceInitializedRef.current) {
      entranceInitializedRef.current = true

      // Camera starts a bit in front of the door
      const startPos = pos.clone().add(new THREE.Vector3(0, 4, 20.1))
      setTargetPos(startPos)
      setTargetLookAt(pos.clone().add(new THREE.Vector3(0, 4.2, 0)))

      if (cameraRef.current) {
        cameraRef.current.position.copy(startPos)
        cameraRef.current.lookAt(pos.clone().add(new THREE.Vector3(0, 4.2, 0)))
      }
    }

    // Position entrance initialized
  }, [])

  // Sync React prop focusedDoor with mutable Ref + detect exit transitions
  const prevFocusedDoorRef = useRef(null)
  useEffect(() => {
    // Detect transition: was focused → now null (user triggered exit from Overlay or keyboard)
    if (prevFocusedDoorRef.current && !focusedDoor && exitPhaseRef.current === 0) {
      // Begin exit animation with the door we were just focused on
      exitingDoorRef.current = { ...prevFocusedDoorRef.current }
      exitPhaseRef.current = 1
      if (setSelectedPaper) setSelectedPaper(null)
    }
    focusedDoorRef.current = focusedDoor
    prevFocusedDoorRef.current = focusedDoor ? { ...focusedDoor } : null
  }, [focusedDoor, setSelectedPaper])

  // Snap scroll position to match focused door's Z coordinate
  const handleRoomDoorClick = useCallback((door) => {
    // Prevent entering a new room while exiting
    if (exitPhaseRef.current > 0) return
    focusedDoorRef.current = door
    setFocusedDoor(door)
  }, [setFocusedDoor])

  // === Begin exit sequence (used internally for manual trigger if needed) ===
  const beginExit = useCallback(() => {
    if (!focusedDoorRef.current || exitPhaseRef.current > 0) return
    // Just clear focusedDoor — the useEffect above will detect the transition
    setFocusedDoor(null)
  }, [setFocusedDoor])

  // Record the moment the user clicks the door
  useEffect(() => {
    if (hasClicked && !clickTimeRef.current) {
      clickTimeRef.current = performance.now()
      entryProgressRef.current = 0
      entryCompleteRef.current = false
    }
  }, [hasClicked])

  // Keyboard: Escape or Backspace to exit room or close selected paper
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Escape' || e.key === 'Backspace') && exitPhaseRef.current === 0) {
        if (selectedPaper) {
          e.preventDefault()
          if (setSelectedPaper) setSelectedPaper(null)
        } else if (focusedDoorRef.current) {
          e.preventDefault()
          setFocusedDoor(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPaper, setSelectedPaper, setFocusedDoor])

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to -1 to 1
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const [currentTargetLookAt] = useState(new THREE.Vector3())

  useFrame((state, delta) => {
    if (!targetPos || !cameraRef.current) return

    // === EXIT ANIMATION (phased reverse sequence) ===
    if (exitPhaseRef.current > 0 && exitingDoorRef.current) {
      const exitDoor = exitingDoorRef.current
      const targetXLimit = exitDoor.x < 0 ? 4.5 : -4.5  // opposite corridor side
      const exitZ = exitDoor.z

      if (exitPhaseRef.current === 1) {
        // Phase 1: Pull camera back from inside room to corridor side (reverse of dive)
        // Door stays OPEN during this phase (Corridor handles it via exitPhase prop)
        const { endX, lookX, exitSpeed = EXIT_PULLBACK_SPEED } = getRoomDiveParameters(exitDoor)
        diveProgressRef.current = THREE.MathUtils.lerp(diveProgressRef.current, 0, 1 - Math.exp(-exitSpeed * delta))

        const startX = targetXLimit
        const currentX = THREE.MathUtils.lerp(startX, endX, diveProgressRef.current)
        const currentY = THREE.MathUtils.lerp(1.6, 1.7, diveProgressRef.current)

        _targetP.set(currentX, currentY, exitZ)

        // Look toward the door we're backing out of
        const lookY = THREE.MathUtils.lerp(1.6, 1.7, diveProgressRef.current)
        _targetL.set(lookX, lookY, exitZ)

        // Camera is fully out of the room when dive progress is very close to 0
        if (diveProgressRef.current < 0.05) {
          diveProgressRef.current = 0
          exitPhaseRef.current = 2  // move to Phase 2: close door
        }
      } else if (exitPhaseRef.current === 2) {
        // Phase 2: Door closes smoothly — camera watches the door close
        _targetP.set(targetXLimit, 1.6, exitZ)

        const lookX = exitDoor.x < 0 ? -9.4 : 9.4  // look at door frame
        _targetL.set(lookX, 1.6, exitZ)

        doorOpenProgressRef.current = THREE.MathUtils.lerp(doorOpenProgressRef.current, 0, 1 - Math.exp(-EXIT_DOOR_CLOSE_SPEED * delta))

        // Door is fully closed when progress is nearly 0
        if (doorOpenProgressRef.current < 0.03) {
          doorOpenProgressRef.current = 0
          exitPhaseRef.current = 3  // move to Phase 3: return to corridor
        }
      } else if (exitPhaseRef.current === 3) {
        // Phase 3: Smoothly glide camera back to corridor scroll position
        // Just let the normal corridor scroll logic take over — clear exit state
        cameraArrivedAtDoorRef.current = false
        if (cameraArrived) setCameraArrived(false)
        exitPhaseRef.current = 0
        exitingDoorRef.current = null
      }

      // During exit, use a faster lerp speed so it feels snappy
      const lerpSpeed = exitPhaseRef.current === 2 ? 0.06 : 0.09
      cameraRef.current.position.lerp(_targetP, lerpSpeed)
      currentTargetLookAt.lerp(_targetL, lerpSpeed)
      cameraRef.current.lookAt(currentTargetLookAt)
      cameraZRef.current = cameraRef.current.position.z
      return // skip normal logic during exit
    }

    // === NORMAL LOGIC (no exit happening) ===
    if (!focusedDoorRef.current) {
      cameraArrivedAtDoorRef.current = false
      if (cameraArrived) setCameraArrived(false)
      doorOpenProgressRef.current = THREE.MathUtils.lerp(doorOpenProgressRef.current, 0, 1 - Math.exp(-3 * delta))
      diveProgressRef.current = THREE.MathUtils.lerp(diveProgressRef.current, 0, 1 - Math.exp(-3 * delta))
    }

    _targetP.copy(targetPos)
    _targetL.copy(targetLookAt)

    if (hasClicked && doorPos) {
      if (focusedDoorRef.current) {
        // Extreme opposite side of the corridor for initial wide view
        const targetXLimit = focusedDoorRef.current.x < 0 ? 4.5 : -4.5
        const targetY = 1.6
        const targetZ = focusedDoorRef.current.z

        // 1. Check if the camera has arrived in front of the door (using robust 2D distance)
        if (!cameraArrivedAtDoorRef.current) {
          const dx = cameraRef.current.position.x - targetXLimit
          const dz = cameraRef.current.position.z - targetZ
          const dist2D = Math.sqrt(dx * dx + dz * dz)
          if (dist2D < 4.0) { // Increased from 1.0 so door starts opening before camera fully stops
            cameraArrivedAtDoorRef.current = true
            setCameraArrived(true)
          }
        }

        if (cameraArrivedAtDoorRef.current) {
          // Start opening the door — SLOWER, more cinematic
          doorOpenProgressRef.current = THREE.MathUtils.lerp(doorOpenProgressRef.current, 1, 1 - Math.exp(-DOOR_OPEN_SPEED * delta))
        } else {
          doorOpenProgressRef.current = THREE.MathUtils.lerp(doorOpenProgressRef.current, 0, 1 - Math.exp(-3 * delta))
        }

        const { endX, lookX, speed = DIVE_SPEED } = getRoomDiveParameters(focusedDoorRef.current)

        // 2. Start camera dive/plunge forward after the door is mostly open
        if (doorOpenProgressRef.current > DIVE_THRESHOLD) {
          diveProgressRef.current = THREE.MathUtils.lerp(diveProgressRef.current, 1, 1 - Math.exp(-speed * delta))
        } else {
          diveProgressRef.current = THREE.MathUtils.lerp(diveProgressRef.current, 0, 1 - Math.exp(-3 * delta))
        }

        const startX = targetXLimit
        const currentX = THREE.MathUtils.lerp(startX, endX, diveProgressRef.current)

        // Raise the camera slightly when entering the room (from 1.6 to 1.7)
        const currentY = THREE.MathUtils.lerp(1.6, 1.7, diveProgressRef.current)

        _targetP.set(currentX, currentY, targetZ)

        // As the camera dives in, turn the lookAt to face the room interior (deeper X)
        // Also raise the lookAt slightly to match camera height
        const lookY = THREE.MathUtils.lerp(1.6, 1.7, diveProgressRef.current)
        _targetL.set(lookX, lookY, focusedDoorRef.current.z)
      } else if (!entryCompleteRef.current) {
        // --- Phase 1: Cinematic entry through the door ---
        entryProgressRef.current += delta / ENTRY_DURATION
        if (entryProgressRef.current >= 1) {
          entryProgressRef.current = 1
          entryCompleteRef.current = true
        }

        // Smooth ease-in-out curve for natural motion
        const t = entryProgressRef.current
        const eased = t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2

        // Interpolate from in front of door to just inside corridor
        const startZ = doorPos.z + 20.1   // starting camera Z (in front)
        const endZ = doorPos.z - ENTRY_DEPTH  // end camera Z (inside corridor)
        const currentZ = THREE.MathUtils.lerp(startZ, endZ, eased)

        _targetP.set(doorPos.x, doorPos.y + 4, currentZ)

        // Look forward along the corridor (15 units ahead, slightly raised Y for grander angle)
        _targetL.set(_targetP.x, _targetP.y + 0.8, _targetP.z - 15)
      } else {
        // --- Phase 2: Scroll-based exploration ---
        _entryPos.set(doorPos.x, doorPos.y + 4, doorPos.z - ENTRY_DEPTH)

        let scrollOffset = scroll ? scroll.offset : 0

        // Ignore stale scroll values for a few frames after teleporting
        if (teleportCooldown.current > 0) {
          teleportCooldown.current--
          scrollOffset = 0
        }



        const scrollDepth = scrollOffset * -400
        const camZEstimate = _entryPos.z + scrollDepth

        // --- Teleport: when camera passes exit door, snap back to start ---
        if (exitDoorZ !== null && cameraRef.current.position.z < exitDoorZ - 5 && scroll.el) {
          scroll.el.scrollTop = 0
          teleportCooldown.current = 3

          // Instantly snap target and camera (slightly behind so it drifts forward naturally)
          _targetP.set(_entryPos.x, _entryPos.y, _entryPos.z + 8)
          _targetL.set(_targetP.x, _targetP.y + 0.8, _targetP.z - 15)

          cameraRef.current.position.copy(_targetP)
          currentTargetLookAt.copy(_targetL)
          cameraRef.current.lookAt(_targetL)
          cameraZRef.current = _targetP.z

          return // skip lerp this frame
        }

        _targetP.set(_entryPos.x, _entryPos.y, _entryPos.z + scrollDepth)

        // Look further ahead (15 units ahead, slightly raised Y for grander angle)
        _targetL.set(_targetP.x, _targetP.y + 0.8, _targetP.z - 15)
      }
    }

    // Frame-rate independent smooth camera movement (Silky smooth 60 FPS)
    const lerpExpSpeed = entryCompleteRef.current ? 5.0 : 7.0
    const lerpAlpha = 1 - Math.exp(-lerpExpSpeed * delta)
    cameraRef.current.position.lerp(_targetP, lerpAlpha)

    // Smoothly lerp the lookAt target
    currentTargetLookAt.lerp(_targetL, lerpAlpha)

    // Apply mouse parallax offset to lookAt (subtle head movement, only inside corridor)
    if (hasClicked && !focusedDoorRef.current) {
      smoothMouseRef.current.x = THREE.MathUtils.lerp(smoothMouseRef.current.x, mouseRef.current.x, 1 - Math.exp(-MOUSE_LERP_SPEED * delta))
      smoothMouseRef.current.y = THREE.MathUtils.lerp(smoothMouseRef.current.y, mouseRef.current.y, 1 - Math.exp(-MOUSE_LERP_SPEED * delta))

      _lookAtVec.copy(currentTargetLookAt)
      _lookAtVec.x += smoothMouseRef.current.x * MOUSE_PARALLAX_X
      _lookAtVec.y += smoothMouseRef.current.y * MOUSE_PARALLAX_Y

      // Auto head-turn toward nearest room door based on camera Z (Asymmetric: slow turn in, fast return out)
      if (roomDoors.length > 0) {
        const camZ = cameraRef.current.position.z
        let bestTurn = 0
        let bestDist = Infinity
        for (const door of roomDoors) {
          const isApproaching = camZ > door.z
          const currentRadius = isApproaching ? HEAD_TURN_RADIUS : 10 // return to center within 10 units after door

          const dist = Math.abs(camZ - door.z)
          if (dist < currentRadius && dist < bestDist) {
            bestDist = dist
            const progress = THREE.MathUtils.clamp(1 - (dist / currentRadius), 0, 1)
            const eased = progress * progress * (3 - 2 * progress)
            // Turn toward door X position
            bestTurn = Math.sign(door.x) * eased * HEAD_TURN_MAX_X
          }
        }

        // Return to center faster than we look away for a snappy feel
        const currentLerp = bestTurn === 0 ? 5.5 : HEAD_TURN_LERP
        headTurnRef.current = THREE.MathUtils.lerp(headTurnRef.current, bestTurn, 1 - Math.exp(-currentLerp * delta))
        _lookAtVec.x += headTurnRef.current
      }

      cameraRef.current.lookAt(_lookAtVec)
    } else {
      cameraRef.current.lookAt(currentTargetLookAt)
    }

    // Track camera Z for scroll-triggered animations in Corridor
    cameraZRef.current = cameraRef.current.position.z
  })

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 1.6, 10]}
        fov={45}
      />

      {/* Atmospheric fog — visible inside corridor and beyond */}
      <fog attach="fog" args={['#faf7f2', 20, 180]} />
      <color attach="background" args={['#faf7f2']} />

      <ambientLight intensity={0.7} color="#fffaee" />
      <Environment preset="city" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#fffaeb"
      />

      <Corridor
        onEntranceFound={onEntranceFound}
        onDoorClick={onDoorClick}
        onCharacterFound={onCharacterFound}
        hasClicked={hasClicked}
        cameraZRef={cameraZRef}
        onExitDoorFound={onExitDoorFound}
        onRoomDoorsFound={setRoomDoors}
        onRoomDoorClick={handleRoomDoorClick}
        cameraArrived={cameraArrived}
        focusedDoor={focusedDoor}
        doorOpenProgressRef={doorOpenProgressRef}
        exitingDoorRef={exitingDoorRef}
        exitPhaseRef={exitPhaseRef}
        onPaperClick={setSelectedPaper}
        selectedPaper={selectedPaper}
        setHoveredPaper={setHoveredPaper}
      />
    </>
  )
}

export default Experience
