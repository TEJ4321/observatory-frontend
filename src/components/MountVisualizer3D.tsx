import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Ring, Stars, Cylinder } from "@react-three/drei";
import { Card } from "./ui/card";
import { ZoomIn, ZoomOut, RotateCcw, Telescope, Compass } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dome } from "./visualizer/Dome";
import { Mount } from "./visualizer/Mount";
import { Floor } from "./visualizer/Floor";

interface MountVisualizer3DProps {
  ra: number;
  dec: number;
  pierSide: "East" | "West" | string;
  siderealTime: string;
  domeAzimuth: number;
  shutterState: "open" | "closed" | "opening" | "closing" | "unknown";
  latitude: number;

  // Dome Configuration
  domeRadius: number;

  // Mount Configuration
  // Pier
  pierHeight?: number;
  pierDiameter?: number;
  pierElevatorHeight?: number;
  pierElevatorTopDiameter?: number;
  pierElevatorBottomDiameter?: number;

  // Mount Base
  mountBaseDiskThickness?: number;
  mountBaseDiskDiameter?: number;
  mountBaseHolderHeight?: number;
  mountBaseHolderThickness?: number;
  mountBasePolarAxisHeight?: number;
  mountBasePolarAxisBoltDiameter?: number;
  mountBasePolarAxisBoltThickness?: number;

  // Mount Polar Axis (RA)
  polarAxisLengthHolderSide?: number;
  polarAxisDiameterHolderSide?: number;
  polarAxisPositionHolderSide?: number;
  polarAxisLengthMotorSideFull?: number;
  polarAxisLengthMotorSideThick?: number;
  polarAxisDiameterMotorSide?: number;

  // Declination Axis
  decAxisLengthMain?: number;
  decAxisDiameterMain?: number;
  decAxisPositionMain?: number;
  decAxisLengthMotor?: number;
  decAxisDiameterMotor?: number;

  // Counterweight
  cwShaftDiameter?: number;
  cwShaftLength?: number;
  cwEndCapDiameter?: number;
  cwEndCapThickness?: number;
  cwWeights?: {
    offset: number;
    diameter: number;
    thickness: number;
  }[];

  // Telescope Tube
  tubeLength?: number;
  tubeDiameter?: number;
  tubePivotPos?: number;
  tubeSensorAreaLength?: number;
  tubeSensorAreaDiameter?: number;
  tubeSecondaryTubeLength?: number;
  tubeSecondaryTubeDiameter?: number;
  tubeSecondaryTubeOffsetRadial?: number;
  tubeSecondaryTubeOffsetAxial?: number;

}

export function MountVisualizer3D({
  ra,
  dec,
  pierSide,
  siderealTime,
  domeAzimuth,
  shutterState,
  latitude = -33.85,
  domeRadius = 2.5,
  // Mount Configuration Defaults
  pierHeight = 1.2,
  pierDiameter = 0.82,
  pierElevatorHeight = 0.24,
  pierElevatorTopDiameter = 0.22,
  pierElevatorBottomDiameter = 0.33,
  mountBaseDiskThickness = 0.08,
  mountBaseDiskDiameter = 0.22,
  mountBaseHolderHeight = 0.23,
  mountBaseHolderThickness = 0.04,
  mountBasePolarAxisHeight = 0.17,
  mountBasePolarAxisBoltDiameter = 0.03,
  mountBasePolarAxisBoltThickness = 0.03,
  polarAxisLengthHolderSide = 0.18,
  polarAxisDiameterHolderSide = 0.12,
  polarAxisPositionHolderSide = 0.05,
  polarAxisLengthMotorSideFull = 0.17,
  polarAxisLengthMotorSideThick = 0.08,
  polarAxisDiameterMotorSide = 0.18,
  decAxisLengthMain = 0.28,
  decAxisDiameterMain = 0.11,
  decAxisPositionMain = 0.1,
  decAxisLengthMotor = 0.08,
  decAxisDiameterMotor = 0.18,
  cwShaftDiameter = 0.04,
  cwShaftLength = 0.4,
  cwEndCapDiameter = 0.05,
  cwEndCapThickness = 0.015,
  cwWeights = [
    { offset: 0.05, diameter: 0.18, thickness: 0.06 },
    { offset: 0.03, diameter: 0.18, thickness: 0.06 },
    { offset: 0.07, diameter: 0.18, thickness: 0.06 },
  ],
  tubeLength = 0.74,
  tubeDiameter = 0.35,
  tubePivotPos = 0.24,
  tubeSensorAreaLength = 0.17,
  tubeSensorAreaDiameter = 0.1,
  tubeSecondaryTubeLength = 0.48,
  tubeSecondaryTubeDiameter = 0.1,
  tubeSecondaryTubeOffsetRadial = 0.08,
  tubeSecondaryTubeOffsetAxial = 0,

}: MountVisualizer3DProps) {
  const controlsRef = useRef<any>(null);

  // This effect will save and restore the camera position
  useEffect(() => {
    controlsRef.current?.saveState();
  }, []);

  const mountOffset = useMemo(() => ({
    x: 0.14 * Math.sin(20 * Math.PI / 180),
    z: -0.14 * Math.cos(20 * Math.PI / 180)
  }), []);

  const resetView = () => {
    controlsRef.current?.reset();
  };

  const topView = () => {
    controlsRef.current?.setAzimuthalAngle(0);
    controlsRef.current?.setPolarAngle(0);
    controlsRef.current?.dollyIn(1.0); // Corrected zoom
  };

  const zoomIn = () => controlsRef.current?.dollyIn(1.2);
  const zoomOut = () => controlsRef.current?.dollyOut(1.2);

  return (
    <Card className="p-4 md:p-6 glass">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Telescope className="w-5 h-5 text-primary" />
          <h3>3D Observatory Visualiser</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={pierSide === "West" ? "default" : "secondary"}>
            Pier: {pierSide}
          </Badge>
          <Badge
            variant={
              shutterState === "open"
                ? "default"
                : shutterState === "closed"
                ? "secondary"
                : "outline"
            }
          >
            {shutterState.charAt(0).toUpperCase() + shutterState.slice(1)}
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="glass"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="glass"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={topView}
              className="glass"
            >
              <Compass className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="glass"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[450px] sm:h-[550px] border border-border rounded-lg glass cursor-grab active:cursor-grabbing touch-none">
        <Canvas
          camera={{
            position: [domeRadius * 2, domeRadius * 1.5, domeRadius * 2],
            fov: 50,
          }}
          gl={{ localClippingEnabled: true }}
          shadows
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[domeRadius * 2, domeRadius * 4, domeRadius]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <Stars
              radius={domeRadius * 2}
              depth={50}
              count={5000}
              factor={4}
              fade
            />
            <Floor size={domeRadius * 2.5} />

            {/* Dome */}
            <group position={[0, pierHeight, 0]}>
              <Dome
                radius={domeRadius}
                azimuth={domeAzimuth}
                shutterState={shutterState}
              />
            </group>

            {/* Observatory Walls */}
            <group>
              <meshStandardMaterial
                color={"#d1d5db"}
                metalness={0.2}
                roughness={0.8}
              />
              {/* Outer Wall */}
              <Cylinder
                args={[
                  domeRadius + 0.1,
                  domeRadius + 0.1,
                  pierHeight,
                  64,
                  1,
                  true,
                ]}
                position={[0, pierHeight / 2, 0]}
              >
                <meshStandardMaterial
                  color={"#d1d5db"}
                  metalness={0.2}
                  roughness={0.8}
                  side={2}
                />
              </Cylinder>
              {/* Inner Wall */}
              <Cylinder
                args={[domeRadius, domeRadius, pierHeight, 64, 1, true]}
                position={[0, pierHeight / 2, 0]}
              >
                <meshStandardMaterial
                  color={"#e5e7eb"}
                  metalness={0.2}
                  roughness={0.8}
                  side={2}
                />
              </Cylinder>
              {/* Top ring of the wall */}
              <Ring
                args={[domeRadius, domeRadius + 0.1, 64]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, pierHeight, 0]}
              >
                <meshStandardMaterial
                  color={"#d1d5db"}
                  metalness={0.2}
                  roughness={0.8}
                />
              </Ring>
            </group>

            <Mount
              ra={ra}
              dec={dec}
              pierSide={pierSide}
              siderealTime={siderealTime}
              latitude={latitude}
              mountOffset={mountOffset}
              // Pier
              pierHeight={pierHeight}
              pierDiameter={pierDiameter}
              pierElevatorHeight={pierElevatorHeight}
              pierElevatorTopDiameter={pierElevatorTopDiameter}
              pierElevatorBottomDiameter={pierElevatorBottomDiameter}
              // Mount Base
              mountBaseDiskThickness={mountBaseDiskThickness}
              mountBaseDiskDiameter={mountBaseDiskDiameter}
              mountBaseHolderHeight={mountBaseHolderHeight}
              mountBaseHolderThickness={mountBaseHolderThickness}
              mountBasePolarAxisHeight={mountBasePolarAxisHeight}
              mountBasePolarAxisBoltDiameter={mountBasePolarAxisBoltDiameter}
              mountBasePolarAxisBoltThickness={mountBasePolarAxisBoltThickness}
              // Mount Polar Axis (RA)
              polarAxisLengthHolderSide={polarAxisLengthHolderSide}
              polarAxisDiameterHolderSide={polarAxisDiameterHolderSide}
              polarAxisPositionHolderSide={polarAxisPositionHolderSide}
              polarAxisLengthMotorSideFull={polarAxisLengthMotorSideFull}
              polarAxisLengthMotorSideThick={polarAxisLengthMotorSideThick}
              polarAxisDiameterMotorSide={polarAxisDiameterMotorSide}
              // Declination Axis
              decAxisLengthMain={decAxisLengthMain}
              decAxisDiameterMain={decAxisDiameterMain}
              decAxisPositionMain={decAxisPositionMain}
              decAxisLengthMotor={decAxisLengthMotor}
              decAxisDiameterMotor={decAxisDiameterMotor}
              // Counterweight
              cwShaftDiameter={cwShaftDiameter}
              cwShaftLength={cwShaftLength}
              cwEndCapDiameter={cwEndCapDiameter}
              cwEndCapThickness={cwEndCapThickness}
              cwWeights={cwWeights}
              // Telescope Tube
              tubeLength={tubeLength}
              tubeDiameter={tubeDiameter}
              tubePivotPos={tubePivotPos}
              tubeSensorAreaLength={tubeSensorAreaLength}
              tubeSensorAreaDiameter={tubeSensorAreaDiameter}
              tubeSecondaryTubeLength={tubeSecondaryTubeLength}
              tubeSecondaryTubeDiameter={tubeSecondaryTubeDiameter}
              tubeSecondaryTubeOffsetRadial={tubeSecondaryTubeOffsetRadial}
              tubeSecondaryTubeOffsetAxial={tubeSecondaryTubeOffsetAxial}
            />
            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.1}
            />
          </Suspense>
        </Canvas>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm opacity-80">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#df681a]" />
            <span className="text-sm">Telescope</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#5e5e5e]" />
            <span className="text-sm">Mount</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#b4b4b4]" />
            <span className="text-sm">Counterweight</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#7d578d]" />
            <span className="text-sm">Dome Slit</span>
          </div>
        </div>

        <div className="mt-3 p-3 bg-muted/40 rounded-lg text-center">
          <p className="opacity-70 text-sm">
            Drag to rotate • Scroll to zoom • Mount offset from dome center
          </p>
        </div>
      </div>
    </Card>
  );
}