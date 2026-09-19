'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, PerspectiveCamera, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Resting three-quarter angle (radians) — front grille + wheels clearly visible
const RESTING_Y_ROTATION = Math.PI * 0.15 // ~27° from front-center

export interface CarModelSceneProps {
  onLoaded?: () => void
}

export default function CarModelScene({ onLoaded }: CarModelSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const hasNotifiedRef = useRef(false)
  const arrivalProgressRef = useRef(0) // 0 → 1 arrival animation progress
  const idleTimeRef = useRef(0) // elapsed time for idle pendulum

  // Load GLB using the local Draco decoder binaries in /draco/
  const { scene } = useGLTF('/models/fiat_abarth_500.glb', '/draco/')

  // Normalize model bounds: center at (0, 0, 0) and place tires exactly on ground (y = 0)
  const model = useMemo(() => {
    const cloned = scene.clone(true)
    const initialBox = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    initialBox.getSize(size)
    const center = new THREE.Vector3()
    initialBox.getCenter(center)

    // Normalize scale so the model comfortably fills the visual column
    const maxDim = Math.max(size.x, size.y, size.z)
    const scaleFactor = 3.3 / maxDim
    cloned.scale.setScalar(scaleFactor)

    // Center horizontally (X and Z) around origin
    cloned.position.x = -center.x * scaleFactor
    cloned.position.z = -center.z * scaleFactor

    // Align base of tires directly to ground plane (y = 0)
    cloned.position.y = -initialBox.min.y * scaleFactor

    // Micro-verify with post-transform bounding box to guarantee exact zero ground contact
    cloned.updateMatrixWorld(true)
    const postBox = new THREE.Box3().setFromObject(cloned)
    cloned.position.y -= postBox.min.y

    // Ensure physical materials and shadow casting
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    return cloned
  }, [scene])

  useEffect(() => {
    // Set initial rotation to start position for arrival animation (facing away, will rotate to front 3/4)
    if (groupRef.current) {
      groupRef.current.rotation.y = RESTING_Y_ROTATION + Math.PI * 0.6 // start ~108° offset
    }
    if (!hasNotifiedRef.current && onLoaded) {
      hasNotifiedRef.current = true
      onLoaded()
    }
  }, [onLoaded])

  // Animation: arrival spin-in for ~1.8s then gentle idle pendulum rocking around the resting angle
  useFrame((_, delta) => {
    if (!groupRef.current) return

    const arrivalDuration = 1.8 // seconds for arrival animation
    const arrival = arrivalProgressRef.current

    if (arrival < 1) {
      // Arrival phase: ease-out rotation from offset to resting angle
      arrivalProgressRef.current = Math.min(1, arrival + delta / arrivalDuration)
      const t = arrivalProgressRef.current
      // Smooth ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const startAngle = RESTING_Y_ROTATION + Math.PI * 0.6
      const endAngle = RESTING_Y_ROTATION
      groupRef.current.rotation.y = startAngle + (endAngle - startAngle) * eased
    } else {
      // Idle phase: gentle pendulum swing around the resting angle (±12°, ~10s cycle)
      idleTimeRef.current += delta
      const swingAmplitude = Math.PI * 0.067 // ~12°
      const swingSpeed = 0.63 // ~10 second cycle
      groupRef.current.rotation.y =
        RESTING_Y_ROTATION + Math.sin(idleTimeRef.current * swingSpeed) * swingAmplitude
    }
  })

  return (
    <>
      {/* Camera: low front three-quarter view at bumper-to-beltline height */}
      <PerspectiveCamera makeDefault position={[3.8, 0.65, 3.4]} fov={36} />

      {/* Manual Three-Point Lighting — warm directional key (100% local, no CDN) */}
      <ambientLight intensity={0.6} />

      {/* Key Light (Front-Right, warm golden-hour tint) */}
      <directionalLight
        position={[6, 6, 5]}
        intensity={2.2}
        color="#fff0d4"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Fill Light (Left, soft cool sky tint for contrast) */}
      <directionalLight
        position={[-6, 3, 3]}
        intensity={0.9}
        color="#c8ddf8"
      />

      {/* Rim / Back Light (Rear edge definition, slightly warm) */}
      <directionalLight
        position={[0, 5, -6]}
        intensity={1.3}
        color="#ffe8cc"
      />

      {/* Subtle warm ground bounce */}
      <directionalLight
        position={[0, -2, 2]}
        intensity={0.25}
        color="#faf0e4"
      />

      {/* Ground Plane — subtle asphalt-like gradient surface giving the car a "place" */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, 0]}
        receiveShadow
      >
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial
          color="#e8e4e0"
          roughness={0.92}
          metalness={0.02}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Radial gradient vignette ring around ground for soft edge fade */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.006, 0]}
      >
        <ringGeometry args={[4.5, 8, 64]} />
        <meshBasicMaterial
          color="#f5f2ef"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* 3D Car Model Hierarchy */}
      <group ref={groupRef} position={[0, 0, 0]}>
        <primitive object={model} />
      </group>

      {/* Soft Ground Contact Shadow tightly fitted to vehicle footprint */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.7}
        scale={5.2}
        blur={1.6}
        far={2.4}
        color="#0a1628"
      />

      {/* Restrained OrbitControls: allow subtle user inspection without getting lost */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={Math.PI / 3.2}
        rotateSpeed={0.5}
        dampingFactor={0.06}
      />
    </>
  )
}

// Preload the local model with local draco decoder
useGLTF.preload('/models/fiat_abarth_500.glb', '/draco/')
