import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cylinder, Sphere, Box } from "@react-three/drei";
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
}


// PIER ==================================================================

interface PierProps {
  height: number;
  diameter: number;
  colorSide?: string;
  colorTop?: string;
  mountOffset: { x: number; z: number };

  elevatorHeight: number;
  elevatorTopDiameter: number;
  elevatorBottomDiameter: number;
  elevatorColor?: string;

}

const Pier = ({
  height = 1.2,
  diameter = 0.82,
  colorSide = "#7d578dff",
  mountOffset = { x: 0.14*Math.sin(20*Math.PI/180), z: -0.14*Math.cos(20*Math.PI/180) },
  elevatorHeight = 0.24,
  elevatorTopDiameter = 0.22,
  elevatorBottomDiameter = 0.33,
  elevatorColor = "#181818ff",
}: PierProps) => {

  return (
    <group>
      <axesHelper args={[1]} />
      {/* Pier Base (sits on the observatory floor)*/}
      <Cylinder
        args={[diameter / 2, diameter / 2, height, 32]}
        position={[0, height / 2, 0]}
        castShadow
      >
        <meshStandardMaterial color={colorSide || "#666"} metalness={0.8} roughness={0.4} />
      </Cylinder>

      {/* Mount Elevator (sits on top of pier to elevate the mount from the pier) */}
      <Cylinder
        args={[elevatorTopDiameter / 2, elevatorBottomDiameter / 2, elevatorHeight, 32]}
        position={[0, height + elevatorHeight / 2, 0]}
        castShadow
      >
        <meshStandardMaterial color={elevatorColor || "#272727ff"} metalness={0.2} roughness={0.2} />
      </Cylinder>

    </group>
  )

}

// MOUNT BASE ============================================================

interface MountBaseProps {
  baseDiskThickness: number;
  baseDiskDiameter: number;
  holderHeight: number;
  holderThickness: number
  polarAxisHeight: number;
  polarAxisBoltDiameter: number;
  polarAxisBoltThickness: number;
  color?: string;
  polarAxisBoltColor?: string;
}

const MountBase = ({
  baseDiskThickness = 0.08,
  baseDiskDiameter = 0.22,
  holderHeight = 0.23,
  holderThickness = 0.04,
  polarAxisHeight = 0.17,
  polarAxisBoltDiameter = 0.03,
  polarAxisBoltThickness = 0.03,
  color = "#5e5e5eff",
  polarAxisBoltColor = "#d3d3d3ff",
}: MountBaseProps) => {
  return (
    <group>
      <axesHelper args={[1]} />
      {/* Mount Base Cylinder (sits directly on the elevator on the pier)*/}
      <Cylinder
        args={[baseDiskDiameter / 2, baseDiskDiameter / 2, baseDiskThickness, 32]}
        position={[0, baseDiskThickness / 2, 0]}
        castShadow
      >
        <meshStandardMaterial color={color || "#3b82f6"} metalness={0.7} roughness={0.3} />
      </Cylinder>

      {/* Holder sides - this should be two rectangular prisms on either side of the polar axis hold it in place */}
      <group>
        <axesHelper args={[1]} />
        <Box
          args={[holderThickness, holderHeight, baseDiskDiameter / 2]}
          position={[baseDiskDiameter / 2, holderHeight / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={color || "#3b82f6"} metalness={0.7} roughness={0.3} />
        </Box>
        <Box
          args={[holderThickness, holderHeight, baseDiskDiameter / 2]}
          position={[-baseDiskDiameter / 2, holderHeight / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={color || "#3b82f6"} metalness={0.7} roughness={0.3} />
        </Box>
        {/* Put a small cylinder at the location of the polar axis height */}
        <Cylinder
          args={[polarAxisBoltDiameter / 2, polarAxisBoltDiameter / 2, polarAxisBoltThickness * 2 + baseDiskDiameter, 32]}
          position={[0, polarAxisHeight, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <meshStandardMaterial color={polarAxisBoltColor || "#3b82f6"} metalness={0.7} roughness={0.3} />
        </Cylinder>
      </group>
    </group>
  )
}


// MOUNT POLAR AXIS ======================================================

interface MountPolarAxisProps {
  length: number;
  diameter: number;
  color?: string;
  axialPosition: number;
}

const MountPolarAxis = ({
  length,
  diameter,
  color,
  axialPosition,
}: MountPolarAxisProps) => {

}

// COUNTERWEIGHT =========================================================

interface WeightProps {
  offset: number;
  diameter: number;
  thickness: number;
  color?: string;
}

interface CounterWeightProps {
  shaftDiameter: number;
  shaftLength: number;
  shaftColor?: string;
  endCapDiameter: number;
  endCapThickness: number;
  endCapColor?: string;
  weights: WeightProps[];
}

const Counterweight = ({
  shaftDiameter,
  shaftLength,
  shaftColor,
  endCapDiameter,
  endCapThickness,
  endCapColor,
  weights,
}: CounterWeightProps) => {
  // This running offset will track the position for the next weight.
  // We start at the base of the shaft.
  let currentPosition = 0;

  return (
    <group>
      {/* DATUM FOR EVERYTHING WITHIN THIS GROUP IS AT THE START OF THE COUNTERWEIGHT SHAFT */}

      <axesHelper args={[1]} />
      {/* Counterweight Shaft */}
      <Cylinder
        args={[shaftDiameter / 2, shaftDiameter / 2, shaftLength, 16]}
        position={[0, shaftLength / 2, 0]}
        castShadow
      >
        <meshStandardMaterial color={shaftColor || "#9ca3af"} metalness={1.0} roughness={0.1} />
      </Cylinder>

      {/* Map through the weights and place them on the shaft */}
      {weights.map((weight, index) => {
        // Add the gap from the weight's offset property
        currentPosition += weight.offset;
        // Calculate the center position for this weight cylinder
        const positionY = -(currentPosition + weight.thickness / 2);
        // Update the running position for the next weight
        currentPosition += weight.thickness;

        return (
          <Cylinder
            key={index}
            args={[weight.diameter / 2, weight.diameter / 2, weight.thickness, 32]}
            position={[0, positionY, 0]}
            castShadow
          >
            <meshStandardMaterial color={weight.color || "#4b5563"} metalness={0.8} roughness={0.3} />
          </Cylinder>
        );
      })}

      {/* End Cap */}
      <Cylinder
        args={[endCapDiameter / 2, endCapDiameter / 2, endCapThickness, 8]}
        position={[-(shaftLength + endCapThickness / 2), 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <meshStandardMaterial color={endCapColor || "#292929ff"} metalness={0.2} roughness={0.2} />
      </Cylinder>
    </group>
  );
};


// TELESCOPE TUBES =======================================================

interface TelescopeTubeProps {
  length: number;
  diameter: number;
  pivotPos: number;
  color?: string;
  sensorAreaLength: number;
  sensorAreaDiameter: number;
  sensorAreaColor?: string;
  secondaryTubeLength: number;
  secondaryTubeDiameter: number;
  secondaryTubeColor?: string;
  secondaryTubeOffsetRadial: number;
  secondaryTubeOffsetAxial: number;
}

const TelescopeTube = ({
  length,
  diameter,
  pivotPos,
  color,
  sensorAreaLength,
  sensorAreaDiameter,
  sensorAreaColor,
  secondaryTubeLength,
  secondaryTubeDiameter,
  secondaryTubeColor,
  secondaryTubeOffsetRadial,
  secondaryTubeOffsetAxial,
}: TelescopeTubeProps) => {
  return (
    // DATUM FOR THIS GROUP IS AT THE PIVOT POSITION OF THE TELESCOPE
    // (THIS IS WHERE THE TELESCOPE TUBE ASSEMBLY MEETS THE DECLINATION AXIS MOTOR)
    <group>
      
      <group position={[0, -pivotPos, 0]}> 
        {/* DATUM FOR EVERYTHING WITHIN THIS GROUP IS AT THE START OF THE TELESCOPE TUBE */}

        <axesHelper args={[1]} />
        {/* Telescope Tube */}
        <Cylinder
          args={[diameter / 2, diameter / 2, length, 32]}
          position={[0, length / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={color || "#ff8229ff"} metalness={0.9} roughness={0.2} />
        </Cylinder>

        {/* Sensor Area */}
        <Cylinder
          args={[sensorAreaDiameter / 2, sensorAreaDiameter / 2, sensorAreaLength, 32]}
          position={[0, -sensorAreaLength / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={sensorAreaColor || "#292929ff"} metalness={0.2} roughness={0.2} />
        </Cylinder>

        {/* Secondary Tube */}
        <Cylinder
          args={[secondaryTubeDiameter / 2, secondaryTubeDiameter / 2, secondaryTubeLength, 32]}
          position={[
            (diameter + secondaryTubeDiameter) / 2 + secondaryTubeOffsetRadial,
            secondaryTubeLength / 2 + secondaryTubeOffsetAxial,
            0]}
          castShadow
        >
          <meshStandardMaterial color={secondaryTubeColor || "#292929ff"} metalness={0.2} roughness={0.2} />
        </Cylinder>
      </group>
    </group>
    
  )
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
                <Counterweight
                  shaftLength={cw.shaftLength} // length of the shaft
                  shaftDiameter={cw.shaftRadius * 2} // diameter of the shaft
                  endCapDiameter={cw.shaftRadius * 2.5} // diameter of the end cap
                  endCapThickness={0.02} // thickness of the end cap
                  weights={Array(cw.amount).fill(0).map((_, i) => ({
                      offset: i === 0 ? cw.firstPos : cw.gap, // First weight offset, then gap for subsequent ones
                      diameter: cw.radius * 2,
                      thickness: cw.thickness,
                      color: cwColor,
                    }))
                  }
                />
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