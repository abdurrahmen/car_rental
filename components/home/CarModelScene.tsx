'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, PerspectiveCamera, ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export interface CarModelSceneProps {
  onLoaded?: () => void
}

export default function CarModelScene({ onLoaded }: CarModelSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const hasNotifiedRef = useRef(false)

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
    if (!hasNotifiedRef.current && onLoaded) {
      hasNotifiedRef.current = true
      onLoaded()
    }
  }, [onLoaded])

  // Continuous subtle idle motion: slow showroom turntable rotation (tires permanently grounded)
  useFrame((_, delta) => {
    if (!groupRef.current) return
    // Gentle turntable rotation (~0.16 rad/s)
    groupRef.current.rotation.y += delta * 0.16
  })

  return (
    <>
      {/* Camera: 3/4 front quarter editorial angle */}
      <PerspectiveCamera makeDefault position={[3.6, 1.4, 4.2]} fov={38} />

      {/* Manual Three-Point Studio Lighting (100% self-contained, no remote CDN dependencies) */}
      <ambientLight intensity={0.75} />

      {/* Key Light (Front-Right, soft warm) */}
      <directionalLight
        position={[6, 8, 5]}
        intensity={2.0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Fill Light (Left, soft cool sky tint) */}
      <directionalLight
        position={[-6, 4, 3]}
        intensity={1.0}
        color="#d0e4ff"
      />

      {/* Rim / Back Light (Rear definition) */}
      <directionalLight
        position={[0, 6, -6]}
        intensity={1.4}
        color="#ffffff"
      />

      {/* Subtle Ground Bounce */}
      <directionalLight
        position={[0, -2, 2]}
        intensity={0.3}
        color="#f8fafc"
      />

      {/* 3D Car Model Hierarchy */}
      <group ref={groupRef} position={[0, 0, 0]}>
        <primitive object={model} />
      </group>

      {/* Soft Ground Contact Shadow tightly fitted to vehicle footprint */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.75}
        scale={4.8}
        blur={1.4}
        far={2.2}
        color="#060c18"
      />

      {/* Restrained OrbitControls: allow subtle user inspection without getting lost */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={Math.PI / 3.6}
        rotateSpeed={0.5}
        dampingFactor={0.06}
      />
    </>
  )
}

// Preload the local model with local draco decoder
useGLTF.preload('/models/fiat_abarth_500.glb', '/draco/')
