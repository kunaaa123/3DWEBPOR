import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { AdaptiveDpr, AdaptiveEvents, ScrollControls, Preload } from '@react-three/drei'
import Experience from './components/Experience'
import Loader from './components/Loader'
import Overlay from './components/Overlay'

function ShaderWarmup({ onComplete }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            if (m.map) gl.initTexture(m.map)
          })
        } else {
          if (child.material.map) gl.initTexture(child.material.map)
        }
      }
    })
    gl.compile(scene, camera)
    window.dispatchEvent(new CustomEvent('model-download-progress', { detail: 100 }))
    if (onComplete) onComplete()
  }, [gl, scene, camera, onComplete])
  return null
}

function App() {
  const [hasClicked, setHasClicked] = useState(false)
  const [ready, setReady] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [focusedDoor, setFocusedDoor] = useState(null)
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [cameraArrived, setCameraArrived] = useState(false)
  const [hoveredPaper, setHoveredPaper] = useState(null)

  return (
    <>
      <Suspense fallback={null}>
        <Canvas
          shadows={false}
          camera={{ position: [0, 2, 10], fov: 45 }}
          gl={{
            antialias: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
        >
          <color attach="background" args={['#faf7f2']} />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Preload all />
          <ShaderWarmup />
          <ScrollControls pages={6} damping={0}>
            <Experience
              onDoorClick={() => setHasClicked(true)}
              onReady={() => setModelReady(true)}
              hasClicked={hasClicked}
              focusedDoor={focusedDoor}
              setFocusedDoor={setFocusedDoor}
              selectedPaper={selectedPaper}
              setSelectedPaper={setSelectedPaper}
              cameraArrived={cameraArrived}
              setCameraArrived={setCameraArrived}
              setHoveredPaper={setHoveredPaper}
            />
          </ScrollControls>
        </Canvas>
      </Suspense>
      {!ready && <Loader modelReady={modelReady} onFinished={() => setReady(true)} />}
      {ready && (
        <Overlay
          hasClicked={hasClicked}
          focusedDoor={focusedDoor}
          setFocusedDoor={setFocusedDoor}
          selectedPaper={selectedPaper}
          setSelectedPaper={setSelectedPaper}
          cameraArrived={cameraArrived}
          hoveredPaper={hoveredPaper}
        />
      )}
    </>
  )
}

export default App
