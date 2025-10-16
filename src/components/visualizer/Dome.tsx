import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

interface DomeProps {
  radius: number;
  azimuth: number;
  shutterState: "open" | "closed" | "opening" | "closing" | "unknown";
}

export const Dome = ({ radius, azimuth, shutterState }: DomeProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const shutterRef = useRef<THREE.Mesh>(null!);

  const domeAzRad = useMemo(() => THREE.MathUtils.degToRad(azimuth), [azimuth]);

  // Define two parallel clipping planes for the fixed-width slit
  const slitWidth = 0.5; // 50cm fixed width
  const clipPlanes = useMemo(
    () => [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -slitWidth / 2),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), -slitWidth / 2),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), // This plane cuts the slit at the zenith
    ],
    [slitWidth]
  );

  // Define angles for the solid base and the slitted upper part
  const horizonAngle = Math.PI / 2; // 90 degrees
  const slitStartAngleFromHorizon = THREE.MathUtils.degToRad(20);
  const slitStartPhi = horizonAngle - slitStartAngleFromHorizon; // Angle from zenith where slit begins

  // Animate dome rotation and shutter position
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smoothly rotate dome to target azimuth
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        domeAzRad,
        0.05
      );
    }

    

    if (shutterRef.current) {
      let targetAngle;
      // The shutter needs to travel from 0 (closed) to `slitStartPhi` (fully open, past the zenith)
      switch (shutterState) {
        case "open":
          targetAngle = slitStartPhi;
          break;
        case "opening":
          targetAngle = slitStartPhi;
          break;
        case "closing":
          targetAngle = 0;
          break;
        case "closed":
        default:
          targetAngle = 0;
          break;
      }
      // Animate shutter sliding up/down
      shutterRef.current.rotation.x = THREE.MathUtils.lerp(
        shutterRef.current.rotation.x,
        targetAngle,
        delta * 2 // Adjust speed of opening/closing
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Upper dome structure, clipped to create a slit */}
      {/* This part goes from the zenith (0) down to 70 degrees */}
      <Sphere
        args={[radius, 64, 64, 0, Math.PI * 2, 0, slitStartPhi]}
        castShadow
      >
        <meshStandardMaterial
          color="#f0f0f0"
          side={THREE.DoubleSide}
          transparent
          opacity={0.15}
          metalness={0.6}
          roughness={0.4}
          clippingPlanes={clipPlanes}
          clipIntersection={true} // Render the part *outside* the planes
        />
      </Sphere>

      {/* Shutter piece that slides over the slit */}
      {/* This piece is clipped to only appear *inside* the slit area */}
      <Sphere
        ref={shutterRef}
        args={[
          radius + 0.01, // Slightly larger radius to avoid z-fighting
          64,
          32,
          0,
          Math.PI * 2,
          0,
          slitStartPhi, // Match the upper dome part
        ]}
        castShadow
      >
        <meshStandardMaterial
          color="#7d578d" // A distinct color for the shutter
          side={THREE.DoubleSide}
          metalness={0.7}
          roughness={0.3}
          clippingPlanes={clipPlanes}
          clipIntersection={false} // Render the part *inside* the planes
        />
      </Sphere>

      {/* Solid base ring of the dome */}
      {/* This part goes from 70 degrees down to the horizon (90 degrees) */}
      <Sphere
        args={[
          radius,
          64,
          64,
          0,
          Math.PI * 2,
          slitStartPhi,
          horizonAngle - slitStartPhi,
        ]}
        castShadow
      >
        <meshStandardMaterial
          color="#f0f0f0"
          side={THREE.DoubleSide}
          transparent
          opacity={0.15}
          metalness={0.6}
          roughness={0.4}
        />
      </Sphere>
    </group>
  );
};