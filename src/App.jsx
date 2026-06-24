import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { AdaptiveDpr, AdaptiveEvents, ScrollControls } from '@react-three/drei'
import Experience from './components/Experience'
import Loader from './components/Loader'
import Overlay from './components/Overlay'

function App() {
  const [hasClicked, setHasClicked] = useState(false)
  const [ready, setReady] = useState(false)
  const [focusedDoor, setFocusedDoor] = useState(null)
  const [selectedPaper, setSelectedPaper] = useState(null)

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
          <color attach="background" args={['#050505']} />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <ScrollControls pages={6} damping={0}>
            <Experience
              onDoorClick={() => setHasClicked(true)}
              onReady={() => setReady(true)}
              hasClicked={hasClicked}
              focusedDoor={focusedDoor}
              setFocusedDoor={setFocusedDoor}
              selectedPaper={selectedPaper}
              setSelectedPaper={setSelectedPaper}
            />
          </ScrollControls>
        </Canvas>
      </Suspense>
      {!ready && <Loader />}
      {ready && (
        <Overlay
          hasClicked={hasClicked}
          focusedDoor={focusedDoor}
          setFocusedDoor={setFocusedDoor}
          selectedPaper={selectedPaper}
          setSelectedPaper={setSelectedPaper}
        />
      )}
    </>
  )
}

export default App
