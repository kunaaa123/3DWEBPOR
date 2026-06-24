import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
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

// Check if mesh is a paper/document inside the project room (Z ~ 4.9, X > 12)
const isProjectPaperMesh = (node) => {
  if (!node || !node.isMesh) return false
  const name = node.name.toLowerCase()

  // Exclude structural/room meshes that are not papers
  if (name.includes('wall') ||
    name.includes('floor') ||
    name.includes('ceiling') ||
    name.includes('table') ||
    name.includes('desk') ||
    name.includes('chair') ||
    name.includes('stool') ||
    name.includes('door') ||
    name.includes('frame') ||
    name.includes('bone') ||
    name.includes('root') ||
    name.includes('room') ||
    name.includes('light') ||
    name.includes('camera') ||
    name.includes('window') ||
    name.includes('curtain') ||
    name.includes('character') ||
    name.includes('avatar') ||
    name.includes('wood') ||
    name.includes('pillar') ||
    name.includes('column') ||
    name.includes('support') ||
    name.includes('entrance') ||
    name.includes('exit')) {
    return false
  }

  // Get world position of the mesh to verify it's inside the project room
  const wp = new THREE.Vector3()
  node.getWorldPosition(wp)
  const inProjectRoom = wp.x > 12.0 && Math.abs(wp.z - 4.9) < 15.0

  return inProjectRoom
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

const Corridor = ({ onEntranceFound, onDoorClick, onCharacterFound, hasClicked, cameraZRef, onExitDoorFound, onRoomDoorsFound, onRoomDoorClick, cameraArrived, focusedDoor, doorOpenProgressRef, exitingDoorRef, exitPhaseRef, onPaperClick, selectedPaper }) => {
  const { scene, animations } = useGLTF('/models/corridor.glb')

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
  const [screenPos, setScreenPos] = useState(null)
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
    const isProjectRoom = focusedDoor && focusedDoor.x > 0 && Math.abs(focusedDoor.z - 4.9) < 10.0
    if (hasClicked && isProjectRoom && cameraArrived && isProjectPaperMesh(e.object)) {
      const wp = new THREE.Vector3()
      e.object.getWorldPosition(wp)
      console.log('[PAPER CLICK] Clicked paper:', e.object.name, 'at world position:', wp)
      if (onPaperClick) {
        onPaperClick({
          name: e.object.name,
          position: wp,
          object: e.object
        })
      }
    }

    // Detect click on computer in the first room when camera has arrived inside
    const isFirstRoom = focusedDoor && focusedDoor.x < 0 && focusedDoor.z > 30.0
    const isComputerPart = (node) => {
      if (!node) return false
      const name = node.name.toLowerCase()
      return name.includes('computer') || name.includes('keyboard') || name.includes('comp') || name.includes('mouse')
    }

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

      // Helper to control an action pair
      const controlActionPair = (actionA, actionB) => {
        if (!actionA || !actionB) return
        const clipDur = actionA.getClip().duration
        const targetTime = easedProgress * clipDur

        // Ensure actions are always playing (paused) — never stop them
        if (!actionA.isRunning || !actionA.enabled) {
          actionA.enabled = true
          actionA.play()
          actionA.paused = true
          actionA.time = 0
        }
        if (!actionB.isRunning || !actionB.enabled) {
          actionB.enabled = true
          actionB.play()
          actionB.paused = true
          actionB.time = 0
        }

        // Smoothly lerp toward target (opens when close, closes back when far)
        actionA.time = THREE.MathUtils.lerp(actionA.time, targetTime, 1 - Math.exp(-SCROLL_ANIM_SPEED * delta))
        actionB.time = THREE.MathUtils.lerp(actionB.time, targetTime, 1 - Math.exp(-SCROLL_ANIM_SPEED * delta))
        actionA.paused = true
        actionB.paused = true
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
        // DON'T apply pose initially — keep disabled until scroll triggers
        action.reset()
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        action.enabled = false  // rest pose preserved, no split
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
    const toRemove = []
    scene.traverse((child) => {
      // Collect unwanted Pencil_Stroke_DEV objects for removal (not needed for web)
      if (child.name && child.name.includes('Pencil_Stroke_DEV')) {
        toRemove.push(child)
        return
      }
      if (child.isMesh || child.isSkinnedMesh) {
        // Double sided materials
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.side = THREE.DoubleSide)
        } else {
          child.material.side = THREE.DoubleSide
        }

        // Check if this is a Cube in the first room (Projects room at Z > 30, X < 0)
        const wp = new THREE.Vector3()
        child.getWorldPosition(wp)
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

        // Discover 1st room computer position (Z > 30, X < -11) for floating tooltip
        if (wp.z > 30.0 && wp.x < -11.0 && (child.name.toLowerCase().includes('computer') || child.name.toLowerCase().includes('comp'))) {
          setScreenPos(new THREE.Vector3(wp.x, wp.y + 1.5, wp.z))
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

        // Show pointer cursor for project papers
        const isProjectRoom = focusedDoor && focusedDoor.x > 0 && Math.abs(focusedDoor.z - 4.9) < 10.0
        if (hasClicked && isProjectRoom && cameraArrived && isProjectPaperMesh(e.object)) {
          document.body.style.cursor = 'pointer'
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

        // Reset cursor when leaving project papers
        const isProjectRoom = focusedDoor && focusedDoor.x > 0 && Math.abs(focusedDoor.z - 4.9) < 10.0
        if (hasClicked && isProjectRoom && cameraArrived && isProjectPaperMesh(e.object)) {
          document.body.style.cursor = 'auto'
        }
      }}
    />
  )
}

useGLTF.preload('/models/corridor.glb')

export default Corridor
