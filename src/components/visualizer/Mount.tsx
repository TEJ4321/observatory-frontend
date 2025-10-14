import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cylinder, Sphere } from "@react-three/drei";
import * as THREE from "three";

const hmsToHours = (hms: string): number => {
  if (!hms || typeof hms !== "string") {
    return 0;
  }
  const parts = hms.split(":");
  if (parts.length !== 3) return 0;
  const [h, m, s] = parts.map(parseFloat);
  return h + m / 60 + s / 3600;
};

interface MountProps {
  ra: number;
  dec: number;
  pierSide: "East" | "West" | string;
  siderealTime: string;
  latitude: number;
  pierHeight: number;
  pierRadius: number;
  mountHeight: number;
  mountOffset: { x: number; z: number };
  raAxis: { length: number; radius: number };
  decAxis: { length: number; radius: number };
  tube: { length: number; radius: number; pivotPos: number };
  cw: {
    shaftLength: number;
    shaftRadius: number;
    amount: number;
    gap: number;
    firstPos: number;
    radius: number;
    thickness: number;
  };
}

export const Mount = ({
  ra,
  dec,
  pierSide,
  siderealTime,
  latitude,
  pierHeight,
  pierRadius,
  mountHeight,
  mountOffset,
  raAxis,
  decAxis,
  tube,
  cw,
}: MountProps) => {
  const raGroupRef = useRef<THREE.Group>(null!);
  const decGroupRef = useRef<THREE.Group>(null!);
  const pierSideRef = useRef<THREE.Group>(null!);

  // Convert astronomical coordinates to 3D rotation angles
  const latRad = useMemo(() => THREE.MathUtils.degToRad(latitude), [latitude]);

  // Animate mount rotation based on RA, Dec, and Pier Side
  useFrame(() => {
    // Calculate Hour Angle = Local Sidereal Time - Right Ascension
    const lstHours = hmsToHours(siderealTime);
    const haHours = lstHours - ra;
    const haRad = THREE.MathUtils.degToRad(haHours * 15);
    const decRad = THREE.MathUtils.degToRad(dec);

    // Determine pier side flip angle
    const pierAngle = pierSide === "East" ? 0 : Math.PI;

    if (raGroupRef.current) {
      // The RA group rotates around the polar axis (local Y) for the hour angle.
      raGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        raGroupRef.current.rotation.y,
        haRad,
        0.1
      );
    }
    if (decGroupRef.current) {
      // The Dec group rotates around its local X axis for declination.
      decGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        decGroupRef.current.rotation.x,
        decRad,
        0.1
      );
    }
    if (pierSideRef.current) {
      // The Pier Side group rotates around the polar axis (local Y) to flip the mount.
      pierSideRef.current.rotation.y = THREE.MathUtils.lerp(
        pierSideRef.current.rotation.y,
        pierAngle,
        0.1
      );
    }
  });

  const mountColor = "#3b82f6";
  const raColor = "#f9ca24";
  const decColor = "#ef4444";
  const tubeColor = "#ff8229ff";
  const cwColor = "#4b5563";

  /*
    Coordinate System and Rotation Hierarchy for the German Equatorial Mount:

    1. World Frame (Observatory Floor):
       - +X: East
       - +Y: Up (Zenith)
       - +Z: South
       - This is a right-handed coordinate system.

    2. Latitude Tilt Group (Mount Base):
       - This group sits on top of the pier.
       - It is rotated by `-latRad` around the World X-axis (East-West axis).
       - This crucial rotation aligns the group's local Y-axis with the Earth's rotational axis,
         making it the "Polar Axis". It points towards the Celestial Pole.
       - Local Frame:
         - +X: Still points East.
         - +Y: Is now the Polar Axis (points towards the pole).
         - +Z: Tilted up from the horizon, perpendicular to the Polar Axis.

    3. RA (Hour Angle) Group (`raGroupRef`):
       - This is a child of the Latitude Tilt group.
       - It rotates around its local Y-axis (the Polar Axis).
       - This rotation corresponds to the Hour Angle (HA) of the target.
       - `rotation.y = haRad`

    4. Pier Side Group (`pierSideRef`):
       - This is a child of the RA group.
       - It rotates by 180 degrees (PI radians) around its local Y-axis (the Polar Axis)
         to perform a "meridian flip".
       - `rotation.y = pierAngle` (0 for West, PI for East)

    5. Declination Group (`decGroupRef`):
       - This is a child of the Pier Side group.
       - It rotates around its local X-axis. This axis is perpendicular to the Polar Axis
         and represents the Declination (Dec) axis.
       - `rotation.x = decRad`

    The final pointing of the telescope is a result of this chain of transformations:
    World -> Latitude Tilt -> RA Rotation -> Pier Flip -> Dec Rotation -> Telescope Offset
  */

  return (
    <group position={[mountOffset.x, 0, mountOffset.z]}>
      
      {/* Pier */}
      <Cylinder
        args={[0.25, 0.25, pierHeight, 32]}
        position={[0, pierHeight / 2, 0]}
      >
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.4} />
      </Cylinder>
      {/* Mount Base */}
      <Cylinder
        args={[raAxis.radius * 1.5, raAxis.radius * 3, mountHeight, 16]}
        position={[0, pierHeight + mountHeight / 2, 0]}
        castShadow
      >
      </Cylinder>

      {/* Mount Ball - this group is tilted in the world east-west axis to point the same direction as Earth's poles based on latitude */}
      <group position={[0, pierHeight + mountHeight, 0]} rotation={[-latRad, 0, 0]}>
        
        <Sphere
          args={[raAxis.radius, 32, 32]}
          position={[0, 0, 0]}
          castShadow
        >
        </Sphere>
        
        
        
        {/* <axesHelper args={[0.25]} /> Axis for the tilted mount base */}
        
        {/* RA Axis Housing (rotates for Hour Angle) */}
        <group ref={raGroupRef}>
          {/* <axesHelper args={[0.25]} /> Axis for RA rotation */}


          {/* This group flips for Pier Side */}
          <group ref={pierSideRef} position={[0, raAxis.length / 2, 0]}>
            <Cylinder
              args={[raAxis.radius, raAxis.radius, raAxis.length, 16]}
              rotation={[0, 0, 0]}
              position={[0, 0, 0]}
              castShadow
            >
              <meshStandardMaterial
                color={mountColor}
                metalness={0.7}
                roughness={0.3}
              />
            </Cylinder>

            {/* Dec Axis Assembly. It's a child of the pier-side group. */}
            <group position={[0, raAxis.length / 2, 0]}>
              {/* Axis for Pier Side flip */}
              <axesHelper args={[1]} />
              
              {/* Dec Axis Cylinder on mount */}
              <Cylinder
                args={[
                  decAxis.radius,
                  decAxis.radius,
                  decAxis.length,
                  16,
                ]}
                rotation={[0, 0, Math.PI / 2]}
                position={[decAxis.length / 2, 0, 0]}
                castShadow
              >
                <meshStandardMaterial
                  color={decColor}
                  metalness={0.7}
                  roughness={0.3}
                />
              </Cylinder>
              
              {/* Counterweight Shaft & Weights */}
              <group position={[0, 0, 0]}>
                {/* <axesHelper args={[0.5]} /> */}
                <Cylinder
                  args={[cw.shaftRadius, cw.shaftRadius, cw.shaftLength, 8]}
                  position={[-cw.shaftLength / 2, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                  castShadow
                >
                  <meshStandardMaterial
                    color="#9ca3af"
                    metalness={1.0}
                    roughness={0.1}
                  />
                </Cylinder>
                
                
                <Cylinder
                  args={[cw.radius, cw.radius, cw.thickness, 16]}
                  position={[-cw.firstPos, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                  castShadow
                >
                  <meshStandardMaterial
                    color={cwColor}
                    metalness={0.9}
                    roughness={0.3}
                  />
                </Cylinder>
                <Cylinder
                  args={[cw.radius, cw.radius, cw.thickness, 16]}
                  position={[-cw.firstPos - (cw.gap + cw.thickness), 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                  castShadow
                >
                  <meshStandardMaterial
                    color={cwColor}
                    metalness={0.9}
                    roughness={0.3}
                  />
                </Cylinder>
                <Cylinder
                  args={[cw.radius, cw.radius, cw.thickness, 16]}
                  position={[-cw.firstPos - (cw.gap + cw.thickness) * 2, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                  castShadow
                >
                  <meshStandardMaterial
                    color={cwColor}
                    metalness={0.9}
                    roughness={0.3}
                  />
                </Cylinder>
              </group>


              {/* This group rotates for Declination */}
              <group ref={decGroupRef} position={[decAxis.length, 0, 0]}>
                <axesHelper args={[4]} />
                
                {/* Telescope Tube */}
                <group rotation={[Math.PI/2, 0, 0]} position={[0, 0, -tube.pivotPos * tube.length]}>
                  {/* Axis for Declination rotation */}
                  {/* <axesHelper args={[4]} />  */}
                  <Cylinder
                    args={[tube.radius, tube.radius, tube.length, 32]}
                    position={[0, tube.length / 2, 0]}
                    rotation={[0, 0, 0]}
                    castShadow
                  >
                    <meshStandardMaterial
                      color={tubeColor}
                      metalness={0.9}
                      roughness={0.2}
                    />
                  </Cylinder>
                </group>


              </group>

            </group>

          </group>
        </group>
      </group>
    </group>
  );
};