import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
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
  pierHeight: number;
  pierRadius: number;
  mountHeight: number;
  mountOffsetX: number;
  mountOffsetZ: number;
  raAxisLength: number;
  raAxisRadius: number;
  decAxisLength: number;
  decAxisRadius: number;

  // Telescope Configuration
  tubeLength: number;
  tubeRadius: number;
  tubePosition: number;
  counterweightShaftLength: number;
  counterweightShaftRadius: number;
  counterweightAmount: number;
  counterweightRadius: number;
  counterweightThickness: number;
  counterweightGap: number;
  counterweightFirstPos: number;
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

  pierHeight = 1.5, // in meters
  pierRadius = 0.41, // in meters
  mountHeight = 0.2, // in meters, height of the actual RA axis mount point
  mountOffsetX = 0.14*Math.sin(20*Math.PI/180), // in meters, +ve east
  mountOffsetZ = 0.14*Math.cos(20*Math.PI/180), // in meters, +ve south
  raAxisLength = 0.1, // in meters
  raAxisRadius = 0.05, // in meters
  decAxisLength = 0.42, // in meters
  decAxisRadius = 0.05, // in meters
  tubeLength = 1.5, // in meters
  tubeRadius = 0.2, // in meters
  tubePosition = 0.4, // decimal between 0 and 1 indicating how far forward the pivot point is
  counterweightShaftLength = 0.9, // in meters
  counterweightShaftRadius = 0.02, // in meters
  counterweightAmount = 3,
  counterweightGap = 0.04, // in meters
  counterweightRadius = 0.06, // in meters
  counterweightFirstPos = 0.18, // in meters
  counterweightThickness = 0.05, // in meters

}: MountVisualizer3DProps) {
  const controlsRef = useRef<any>(null);

  // This effect will save and restore the camera position
  useEffect(() => {
    controlsRef.current?.saveState();
  }, []);

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
              factor={10}
            />
            <Floor size={domeRadius * 2.5} />
            {/* {shutterState !== "open" && (
              <Dome
                radius={domeRadius}
                azimuth={domeAzimuth}
                shutterState={shutterState}
              />
            )} */}
            <Mount
              ra={ra}
              dec={dec}
              pierSide={pierSide}
              siderealTime={siderealTime}
              latitude={latitude}
              pierHeight={pierHeight}
              pierRadius={pierRadius}
              mountHeight={mountHeight}
              mountOffset={{ x: mountOffsetX, z: mountOffsetZ }}
              raAxis={{ length: raAxisLength, radius: raAxisRadius }}
              decAxis={{ length: decAxisLength, radius: decAxisRadius }}
              tube={{ length: tubeLength, radius: tubeRadius, pivotPos: tubePosition}}
              cw={{
                shaftLength: counterweightShaftLength,
                shaftRadius: counterweightShaftRadius,
                amount: counterweightAmount,
                gap: counterweightGap,
                firstPos: counterweightFirstPos,
                radius: counterweightRadius,
                thickness: counterweightThickness,
              }}
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
            <div className="w-4 h-1 bg-[#3b82f6]" />
            <span className="text-sm">RA Axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#ef4444]" />
            <span className="text-sm">Dec Axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#e5e7eb]" />
            <span className="text-sm">Telescope</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#f0f0f0]" />
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