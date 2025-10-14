import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";

interface DomeProps {
  radius: number;
  azimuth: number;
  shutterState: "open" | "closed" | "opening" | "closing" | "unknown";
}

export const Dome = ({ radius, azimuth, shutterState }: DomeProps) => {
  const domeRef = useRef<THREE.Group>(null!);

  const domeAzRad = useMemo(() => THREE.MathUtils.degToRad(azimuth), [azimuth]);

  // Animate dome rotation
  useFrame(() => {
    if (domeRef.current) {
      // Smoothly rotate dome to target azimuth
      domeRef.current.rotation.y = THREE.MathUtils.lerp(
        domeRef.current.rotation.y,
        domeAzRad,
        0.05
      );
    }
  });

  const shutterOpen = shutterState === "open" || shutterState === "opening";

  return (
    <group ref={domeRef}>
      {/* Main dome structure */}
      <Sphere
        args={[radius, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#f0f0f0"
          side={THREE.DoubleSide}
          transparent
          opacity={shutterOpen ? 0.1 : 0.25}
          metalness={0.6}
          roughness={0.4}
        />
      </Sphere>
      {/* Dome base ring */}
      <Cylinder args={[radius, radius, radius * 0.05, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.3} />
      </Cylinder>
    </group>
  );
};