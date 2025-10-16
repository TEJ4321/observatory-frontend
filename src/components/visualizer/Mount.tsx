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
  mountOffset: { x: number; z: number };

  // Pier
  pierHeight: number;
  pierDiameter: number;
  pierColorSide?: string;
  pierElevatorHeight: number;
  pierElevatorTopDiameter: number;
  pierElevatorBottomDiameter: number;
  pierElevatorColor?: string;

  // Mount Base
  mountBaseDiskThickness: number;
  mountBaseDiskDiameter: number;
  mountBaseHolderHeight: number;
  mountBaseHolderThickness: number;
  mountBasePolarAxisHeight: number;
  mountBasePolarAxisBoltDiameter: number;
  mountBasePolarAxisBoltThickness: number;
  mountBaseColor?: string;
  mountBasePolarAxisBoltColor?: string;

  // Mount Polar Axis (RA)
  polarAxisLengthHolderSide: number;
  polarAxisDiameterHolderSide: number;
  polarAxisColorHolderSide?: string;
  polarAxisPositionHolderSide: number;
  polarAxisLengthMotorSideFull: number;
  polarAxisLengthMotorSideThick: number;
  polarAxisDiameterMotorSide: number;
  polarAxisColorMotorSide?: string;

  // Declination Axis
  decAxisLengthMain: number;
  decAxisDiameterMain: number;
  decAxisColorMain?: string;
  decAxisPositionMain: number;
  decAxisLengthMotor: number;
  decAxisDiameterMotor: number;
  decAxisColorMotor?: string;

  // Counterweight
  cwShaftDiameter: number;
  cwShaftLength: number;
  cwShaftColor?: string;
  cwEndCapDiameter: number;
  cwEndCapThickness: number;
  cwEndCapColor?: string;
  cwWeights: WeightProps[];

  // Telescope Tube
  tubeLength: number;
  tubeDiameter: number;
  tubePivotPos: number;
  tubeColor?: string;
  tubeSensorAreaLength: number;
  tubeSensorAreaDiameter: number;
  tubeSensorAreaColor?: string;
  tubeSecondaryTubeLength: number;
  tubeSecondaryTubeDiameter: number;
  tubeSecondaryTubeColor?: string;
  tubeSecondaryTubeOffsetRadial: number;
  tubeSecondaryTubeOffsetAxial: number;
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
        position={[mountOffset.x, height + elevatorHeight / 2, mountOffset.z]}
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


// MOUNT POLAR (RA) AXIS COMPONENTS ======================================

interface MountPolarAxisProps {
  lengthHolderSide: number;
  diameterHolderSide: number;
  colorHolderSide?: string;
  positionHolderSide: number;
  lengthMotorSideFull: number;
  lengthMotorSideThick: number;
  diameterMotorSide: number;
  colorMotorSide?: string;
}

const MountPolarAxis = ({
  lengthHolderSide = 0.18,
  diameterHolderSide = 0.12,
  colorHolderSide = "#5e5e5eff",
  positionHolderSide = 0.05,
  lengthMotorSideFull = 0.17,
  colorMotorSide = "#5e5e5eff",
  lengthMotorSideThick = 0.08,
  diameterMotorSide = 0.12,
}: MountPolarAxisProps) => {
  return (
    // DATUM FOR THIS GROUP IS AT THE PIVOT POSITION OF THE HOLDER
    // (THIS IS WHERE THE MOUNT BASE ASSEMBLY MEETS THE POLAR (RA) AXIS)
    <group>
      
      <group position={[0, positionHolderSide, 0]}> 
        {/* DATUM FOR EVERYTHING WITHIN THIS GROUP IS AT BORDER BETWEEN THE HOLDER SIDE AND THE MOTOR SIDE */}

        <axesHelper args={[1]} />
        {/* Holder Side Tube */}
        <Cylinder
          args={[diameterHolderSide / 2, diameterHolderSide / 2, lengthHolderSide, 32]}
          position={[0, -lengthHolderSide / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={colorHolderSide || "#3b82f6"} metalness={0.7} roughness={0.3} />
        </Cylinder>

        {/* Motor Side Tube */}
        <Cylinder
          args={[diameterMotorSide / 2, diameterMotorSide / 2, lengthMotorSideThick, 32]}
          position={[0, lengthMotorSideThick / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={colorMotorSide || "#3b82f6"} metalness={0.7} roughness={0.3} />
        </Cylinder>

        {/* Cone on motor side (Connection point to the dec axis) */}
        <Cylinder
          args={[diameterMotorSide / 2, 0.055, lengthMotorSideFull - lengthMotorSideThick, 32]}
          position={[0, (lengthMotorSideFull - lengthMotorSideThick) / 2 + lengthMotorSideThick, 0]}
          castShadow
        >
          <meshStandardMaterial color={colorMotorSide || "#3b82f6"} metalness={0.7} roughness={0.3} />
        </Cylinder>
          
      </group>
    </group>
  )
}


// DECLINATION AXIS ======================================================

interface DeclinationAxisProps {
  lengthMain: number;
  diameterMain: number;
  colorMain?: string;
  positionMain: number;
  lengthMotor: number;
  diameterMotor: number;
  colorMotor?: string;
}

const DeclinationAxis = ({
  lengthMain = 0.28,
  diameterMain = 0.11,
  colorMain = "#5e5e5eff",
  positionMain = 0.1,
  lengthMotor = 0.08,
  diameterMotor = 0.18,
  colorMotor = "#5e5e5eff",
}: DeclinationAxisProps) => {
  return (
    // DATUM FOR THIS GROUP IS AT THE PIVOT POSITION OF THE DEC
    // (THIS IS WHERE THE DEC AXIS MEETS THE POLAR (RA) AXIS)
    <group>
      
      <group position={[0, positionMain, 0]}> 
        {/* DATUM FOR EVERYTHING WITHIN THIS GROUP IS AT BORDER BETWEEN THE MAIN SIDE AND THE MOTOR SIDE */}

        <axesHelper args={[1]} />
        {/* Main Side */}
        <Cylinder
          args={[diameterMain / 2, diameterMain / 2, lengthMain, 32]}
          position={[0, -lengthMain / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={colorMain || "#3b82f6"} metalness={0.7} roughness={0.3} />
        </Cylinder>

        {/* Motor Side */}
        <Cylinder
          args={[diameterMotor / 2, diameterMotor / 2, lengthMotor, 32]}
          position={[0, lengthMotor / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={colorMotor || "#3b82f6"} metalness={0.7} roughness={0.3} />
        </Cylinder>
        
      </group>
    </group>
  )
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
  shaftDiameter = 0.04,
  shaftLength = 0.4,
  shaftColor = "#a0a6afff",
  endCapDiameter = 0.05,
  endCapThickness = 0.015,
  endCapColor = "#292929ff",
  weights = [
    { offset: 0.05, diameter: 0.18, thickness: 0.06, color: "#b4b4b4ff" },
    { offset: 0.03, diameter: 0.18, thickness: 0.06, color: "#b4b4b4ff" },
    { offset: 0.07, diameter: 0.18, thickness: 0.06, color: "#b4b4b4ff" },
  ],
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
        const positionY = currentPosition + (weight.thickness / 2);
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
  length = 0.74,
  diameter = 0.35,
  pivotPos = 0.24,
  color = "#df681aff",
  sensorAreaLength = 0.17,
  sensorAreaDiameter = 0.1,
  sensorAreaColor = "#990a0aff",
  secondaryTubeLength = 0.48,
  secondaryTubeDiameter = 0.1,
  secondaryTubeColor = "#1588d4ff",
  secondaryTubeOffsetRadial = 0.12,
  secondaryTubeOffsetAxial = 0,
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
  mountOffset,
  // Pier
  pierHeight,
  pierDiameter,
  pierColorSide,
  pierElevatorHeight,
  pierElevatorTopDiameter,
  pierElevatorBottomDiameter,
  pierElevatorColor,
  // Mount Base
  mountBaseDiskThickness,
  mountBaseDiskDiameter,
  mountBaseHolderHeight,
  mountBaseHolderThickness,
  mountBasePolarAxisHeight,
  mountBasePolarAxisBoltDiameter,
  mountBasePolarAxisBoltThickness,
  mountBaseColor,
  mountBasePolarAxisBoltColor,
  // Mount Polar Axis (RA)
  polarAxisLengthHolderSide,
  polarAxisDiameterHolderSide,
  polarAxisColorHolderSide,
  polarAxisPositionHolderSide,
  polarAxisLengthMotorSideFull,
  polarAxisLengthMotorSideThick,
  polarAxisDiameterMotorSide,
  polarAxisColorMotorSide,
  // Declination Axis
  decAxisLengthMain,
  decAxisDiameterMain,
  decAxisColorMain,
  decAxisPositionMain,
  decAxisLengthMotor,
  decAxisDiameterMotor,
  decAxisColorMotor,
  // Counterweight
  cwShaftDiameter,
  cwShaftLength,
  cwShaftColor,
  cwEndCapDiameter,
  cwEndCapThickness,
  cwEndCapColor,
  cwWeights,
  // Telescope Tube
  tubeLength,
  tubeDiameter,
  tubePivotPos,
  tubeColor,
  tubeSensorAreaLength,
  tubeSensorAreaDiameter,
  tubeSensorAreaColor,
  tubeSecondaryTubeLength,
  tubeSecondaryTubeDiameter,
  tubeSecondaryTubeColor,
  tubeSecondaryTubeOffsetRadial,
  tubeSecondaryTubeOffsetAxial,
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
      // The Dec group rotates around its local Y axis for declination.
      decGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        decGroupRef.current.rotation.y,
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


  /** ====================================================================
   * Transformation Definitions and Order:
   * 
   * World Axes:
   * +X is East
   * +Y is Up (Zenith)
   * +Z is South
   * 
   * Order of object construction positioning and rotation (nested):
   * 1. Pier placed at (0,0), with built in mount elevator located on top of it
   *    - no rotations
   * 
   *    2. Mount base placed on top of mount elevator
   *      - no rotations
   * 
   *      3. RA Axis (latitude tilt group) placed at the holder height above the mount base mount
   *        - Rotated in the world x-axis (East/West axis) by -latRad
   *        - +X: Still points East.
   *        - +Y: Is now the Polar Axis (points towards the celestial pole).
   *        - +Z: Tilted from the horizon, perpendicular to the Polar Axis.
   * 
   *        4. RA Motor group (RA hour angle rotation group) - the stuff connected to the rotating RA motor, located at: lengthMotorSideFull + positionHolderSide from the mount point of the RA axis on the holder
   *          - This rotates around its local y-axis, which is the celestial polar axis
   * 
   *          5. Pier Side rotation group (rotates about local y-axis again to allow for 180 degrees of rotation)
   *            
   *            6. Declination Axis group
   *              - GROUP rotated 90 degrees so that its local y-axis is perpendicular to the pier side rotation group's y-axis
   *              - Contains the declination axis body and the counterweights and shaft on the end of the main side
   *              
   *              7. Declination Rotation group
   *                - GROUP rotated by the amount of declination degrees
   *                
   *                8. Telescope tube group
   * 
   * 
   * =====================================================================
   */




  return (
    <group position={[0, 0, 0]}>
      {/* Pier */}
      <Pier
        height={pierHeight}
        diameter={pierDiameter}
        colorSide={pierColorSide}
        mountOffset={mountOffset}
        elevatorHeight={pierElevatorHeight}
        elevatorTopDiameter={pierElevatorTopDiameter}
        elevatorBottomDiameter={pierElevatorBottomDiameter}
        elevatorColor={pierElevatorColor}
      />

      {/* Mount Base Group - positioned on top of the pier elevator */}
      <group position={[mountOffset.x, pierHeight + pierElevatorHeight, mountOffset.z]}>
        <MountBase
          baseDiskThickness={mountBaseDiskThickness}
          baseDiskDiameter={mountBaseDiskDiameter}
          holderHeight={mountBaseHolderHeight}
          holderThickness={mountBaseHolderThickness}
          polarAxisHeight={mountBasePolarAxisHeight}
          polarAxisBoltDiameter={mountBasePolarAxisBoltDiameter}
          polarAxisBoltThickness={mountBasePolarAxisBoltThickness}
          color={mountBaseColor}
          polarAxisBoltColor={mountBasePolarAxisBoltColor}
        />

        {/* RA Axis Origin - Position where the RA axis is held by the mount base */}
        <group position={[0, mountBasePolarAxisHeight, 0]}>

          {/* Latitude Tilt Group */}
          {/* This group is tilted in the world east-west axis to point the same direction as Earth's poles based on latitude */}
          <group rotation={[-latRad, 0, 0]}>
            <MountPolarAxis
              lengthHolderSide={polarAxisLengthHolderSide}
              diameterHolderSide={polarAxisDiameterHolderSide}
              colorHolderSide={polarAxisColorHolderSide}
              positionHolderSide={polarAxisPositionHolderSide}
              lengthMotorSideFull={polarAxisLengthMotorSideFull}
              lengthMotorSideThick={polarAxisLengthMotorSideThick}
              diameterMotorSide={polarAxisDiameterMotorSide}
              colorMotorSide={polarAxisColorMotorSide}
            />


            {/* RA Hour Angle Rotation Group */}
            <group ref={raGroupRef} position={[0, polarAxisLengthMotorSideFull + polarAxisPositionHolderSide, 0]}>

              {/* Pier Side Rotation Group */}
              <group ref={pierSideRef}>

                {/* Declination Axis Centre Group */}
                <group position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <DeclinationAxis
                    lengthMain={decAxisLengthMain}
                    diameterMain={decAxisDiameterMain}
                    colorMain={decAxisColorMain}
                    positionMain={decAxisPositionMain}
                    lengthMotor={decAxisLengthMotor}
                    diameterMotor={decAxisDiameterMotor}
                    colorMotor={decAxisColorMotor}
                  />

                  {/* Counterweight Group */}
                  <group position={[0, decAxisPositionMain - decAxisLengthMain, 0]}>
                    <Counterweight
                      shaftDiameter={cwShaftDiameter}
                      shaftLength={cwShaftLength}
                      shaftColor={cwShaftColor}
                      endCapDiameter={cwEndCapDiameter}
                      endCapThickness={cwEndCapThickness}
                      endCapColor={cwEndCapColor}
                      weights={cwWeights}
                    />
                  </group>

                  {/* Declination Motor Rotation Group */}
                  <group ref={decGroupRef} position={[0, decAxisPositionMain + decAxisLengthMotor, 0]}>

                    {/* Telescope Tube Group */}
                    <group rotation={[0, 0, Math.PI / 2]}>
                      <TelescopeTube
                        length={tubeLength}
                        diameter={tubeDiameter}
                        pivotPos={tubePivotPos}
                        color={tubeColor}
                        sensorAreaLength={tubeSensorAreaLength}
                        sensorAreaDiameter={tubeSensorAreaDiameter}
                        sensorAreaColor={tubeSensorAreaColor}
                        secondaryTubeLength={tubeSecondaryTubeLength}
                        secondaryTubeDiameter={tubeSecondaryTubeDiameter}
                        secondaryTubeColor={tubeSecondaryTubeColor}
                        secondaryTubeOffsetRadial={tubeSecondaryTubeOffsetRadial}
                        secondaryTubeOffsetAxial={tubeSecondaryTubeOffsetAxial}
                      />
                    </group>

                  </group> {/* Declination Axis Motor Rotation */}

                </group> {/* Declination Axis Centre*/}

              </group> {/* Pier Side */}

            </group> {/* RA Hour Angle */}

          </group> {/* Latitude */}

        </group> {/* RA Axis Origin */}

      </group> {/* Mount Base */}

    {/* Overall */}
    </group> 
  );
};