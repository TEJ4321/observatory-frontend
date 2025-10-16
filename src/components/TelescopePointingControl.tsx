import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Target, Navigation, Repeat, FlipHorizontal, Crosshair, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Move, XSquare } from "lucide-react";
import { useState } from "react";

interface TelescopePointingControlProps {
  currentRA: number;
  currentDec: number;
  currentAlt: number;
  currentAz: number;
  isTracking: boolean;
  mountReady: boolean;
  pierSide: "East" | "West" | string;
  status: string;
  onSetTarget: (coords: {
    ra?: number;
    dec?: number;
    alt?: number;
    az?: number;
    direction?: 'N' | 'S' | 'E' | 'W';
    duration_ms?: number;
    halt?: 'all' | 'N' | 'S' | 'E' | 'W';
  }) => void;
  onToggleTracking: () => void;
  onFlipPierSide: () => void;
}

export function TelescopePointingControl({
  currentRA,
  currentDec,
  currentAlt,
  currentAz,
  isTracking,
  mountReady,
  pierSide,
  status,
  onSetTarget,
  onToggleTracking, 
  onFlipPierSide
}: TelescopePointingControlProps) {
  const [coordType, setCoordType] = useState<"equatorial" | "altaz">("equatorial");
  const [targetRA, setTargetRA] = useState("");
  const [targetDec, setTargetDec] = useState("");
  const [targetAlt, setTargetAlt] = useState("");
  const [targetAz, setTargetAz] = useState("");
  const [nudgeDuration, setNudgeDuration] = useState(500);
  const [isSlewing, setIsSlewing] = useState(false); // TEST THIS

  // Convert coordinates for visualization
  const centerX = 150;
  const centerY = 150;
  const radius = 120;
  
  // Calculate position on Alt/Az chart (altitude from center, azimuth as angle)
  const altRadius = ((90 - currentAlt) / 90) * radius;
  const azRad = (currentAz - 90) * (Math.PI / 180); // Rotate so 0° is at top
  
  const telescopeX = centerX + altRadius * Math.cos(azRad);
  const telescopeY = centerY + altRadius * Math.sin(azRad);

  const handleSlew = () => {
    setIsSlewing(true); // TEST THIS
    if (coordType === "equatorial" && targetRA && targetDec) {
      onSetTarget({ ra: parseFloat(targetRA), dec: parseFloat(targetDec) });
    } else if (coordType === "altaz" && targetAlt && targetAz) {
      onSetTarget({ alt: parseFloat(targetAlt), az: parseFloat(targetAz) });
    }
  };

  const handleSyncCurrent = () => {
    if (coordType === "equatorial") {
      setTargetRA(currentRA.toFixed(4));
      setTargetDec(currentDec.toFixed(4));
    } else {
      setTargetAlt(currentAlt.toFixed(2));
      setTargetAz(currentAz.toFixed(2));
    }
  };

  const handleNudge = async (direction: 'N' | 'S' | 'E' | 'W') => {
    try {
      await onSetTarget({ direction, duration_ms: nudgeDuration });
    } catch (error) {
      console.error(`Failed to nudge ${direction}:`, error);
    }
  };

  const handleMoveStart = async (direction: 'N' | 'S' | 'E' | 'W') => {
    try {
      await onSetTarget({ direction });
    } catch (error) {
      console.error(`Failed to start move ${direction}:`, error);
    }
  };

  const handleMoveEnd = async () => {
    try {
      await onSetTarget({ halt: 'all' });
    } catch (error) {
      console.error(`Failed to halt movement:`, error);
    }
  };

  const handleHaltDirection = async (direction: 'N' | 'S' | 'E' | 'W') => {
    try {
      await onSetTarget({ halt: direction });
    } catch (error) {
      console.error(`Failed to halt direction ${direction}:`, error);
    }
  }

  const getStatusBadge = () => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("slewing")) {
      return <Badge variant="default" className="bg-blue-500">Slewing</Badge>;
    }
    if (lowerStatus.includes("tracking")) {
      return <Badge variant="default" className="bg-green-500">Tracking</Badge>;
    }
    if (lowerStatus.includes("parked")) {
      return <Badge variant="destructive">Parked</Badge>;
    }
    if (lowerStatus.includes("stopped") || lowerStatus.includes("idle")) {
      return <Badge variant="secondary">Idle</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <Card className="p-4 md:p-6 glass">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-primary" />
          <h3>Telescope Pointing & Control</h3>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor="tracking" className="cursor-pointer">Tracking</Label>
            <Switch 
              id="tracking" 
              checked={isTracking} 
              onCheckedChange={onToggleTracking}
            />
          </div>
          <Badge variant={pierSide === "West" ? "default" : "secondary"}>
            Pier: {pierSide}
          </Badge>
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Sky Chart */}
        <div>
          <h4 className="mb-3 opacity-70">Current Position</h4>
          <div className="flex flex-col items-center">
            <div className="mb-2 opacity-70">Alt/Az Sky Chart</div>
            <svg viewBox="0 0 300 300" className="w-full max-w-[300px] h-auto border border-border rounded-lg glass">
              {/* Concentric circles for altitude */}
              <circle cx={centerX} cy={centerY} r={120} fill="none" stroke="currentColor" strokeOpacity="0.1" />
              <circle cx={centerX} cy={centerY} r={80} fill="none" stroke="currentColor" strokeOpacity="0.1" />
              <circle cx={centerX} cy={centerY} r={40} fill="none" stroke="currentColor" strokeOpacity="0.1" />
              
              {/* Cardinal directions */}
              <text x={centerX} y="20" textAnchor="middle" className="fill-muted-foreground" fontSize="12">N</text>
              <text x={centerX} y="290" textAnchor="middle" className="fill-muted-foreground" fontSize="12">S</text>
              <text x="20" y={centerY + 5} textAnchor="middle" className="fill-muted-foreground" fontSize="12">W</text>
              <text x="280" y={centerY + 5} textAnchor="middle" className="fill-muted-foreground" fontSize="12">E</text>
              
              {/* Cross-hair lines */}
              <line x1={centerX} y1="30" x2={centerX} y2="270" stroke="currentColor" strokeOpacity="0.1" />
              <line x1="30" y1={centerY} x2="270" y2={centerY} stroke="currentColor" strokeOpacity="0.1" />
              
              {/* Crosshair on telescope position */}
              <circle
                cx={telescopeX}
                cy={telescopeY}
                r="6"
                fill={isTracking ? "#03c951" : "#fbbf24"}
                opacity="0.9"
                className={isTracking ? "animate-pulse" : ""}
              />
              <circle
                cx={telescopeX}
                cy={telescopeY}
                r="10"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                opacity="0.7"
                className={isTracking ? "animate-pulse" : ""}
              />
              <circle
                cx={telescopeX}
                cy={telescopeY}
                r="14"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1"
                opacity="0.4"
                className={isTracking ? "animate-pulse" : ""}
              />

              {/* Static crosshair plus on telescope position */}
              <line 
                x1={telescopeX - 18} y1={telescopeY} 
                x2={telescopeX + 18} y2={telescopeY} 
                stroke="#fbbf24" strokeWidth="1" opacity="0.5"
                className={isTracking ? "animate-pulse" : ""}
              />
              <line 
                x1={telescopeX} y1={telescopeY - 18} 
                x2={telescopeX} y2={telescopeY + 18} 
                stroke="#fbbf24" strokeWidth="1" opacity="0.5"
                className={isTracking ? "animate-pulse" : ""}
              />
              
              {/* Zenith indicator */}
              <circle cx={centerX} cy={centerY} r="3" fill="currentColor" opacity="0.3" />
            </svg>

            <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-[300px]">
              <div className="p-3 bg-muted/40 rounded-lg glass backdrop-blur-md">
                <div className="opacity-70 mb-1 text-sm">Right Ascension</div>
                <div className="text-lg tabular-nums">{currentRA.toFixed(4)}h</div>
              </div>
              
              <div className="p-3 bg-muted/40 rounded-lg glass backdrop-blur-md">
                <div className="opacity-70 mb-1 text-sm">Declination</div>
                <div className="text-lg tabular-nums">{currentDec.toFixed(4)}°</div>
              </div>
              
              <div className="p-3 bg-muted/40 rounded-lg glass backdrop-blur-md">
                <div className="opacity-70 mb-1 text-sm">Altitude</div>
                <div className="text-lg tabular-nums">{currentAlt.toFixed(2)}°</div>
              </div>
              
              <div className="p-3 bg-muted/40 rounded-lg glass backdrop-blur-md">
                <div className="opacity-70 mb-1 text-sm">Azimuth</div>
                <div className="text-lg tabular-nums">{currentAz.toFixed(2)}°</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Control Panel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="opacity-70">Set Target</h4>
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-sm">{isTracking ? 'Tracking' : 'Not Tracking'}</span>
              </div>
            </div>
          </div>
          
          <Tabs value={coordType} onValueChange={(v: "equatorial" | "altaz") => setCoordType(v as "equatorial" | "altaz")}>
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="equatorial">
                <Navigation className="w-4 h-4 mr-2" />
                Equatorial
              </TabsTrigger>
              <TabsTrigger value="altaz">
                <Repeat className="w-4 h-4 mr-2" />
                Alt/Az
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equatorial" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ra">Right Ascension (hours)</Label>
                  <Input
                    id="ra"
                    type="number"
                    step="0.0001"
                    placeholder="0.0000"
                    value={targetRA}
                    onChange={(e) => setTargetRA(e.target.value)}
                    className="glass"
                  />
                  <p className="text-sm opacity-60">Current: {currentRA.toFixed(4)}h</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dec">Declination (degrees)</Label>
                  <Input
                    id="dec"
                    type="number"
                    step="0.0001"
                    placeholder="0.0000"
                    value={targetDec}
                    onChange={(e) => setTargetDec(e.target.value)}
                    className="glass"
                  />
                  <p className="text-sm opacity-60">Current: {currentDec.toFixed(4)}°</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="altaz" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alt">Altitude (degrees)</Label>
                  <Input
                    id="alt"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={targetAlt}
                    onChange={(e) => setTargetAlt(e.target.value)}
                    className="glass"
                  />
                  <p className="text-sm opacity-60">Current: {currentAlt.toFixed(2)}°</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="az">Azimuth (degrees)</Label>
                  <Input
                    id="az"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={targetAz}
                    onChange={(e) => setTargetAz(e.target.value)}
                    className="glass"
                  />
                  <p className="text-sm opacity-60">Current: {currentAz.toFixed(2)}°</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {/* TEST THIS */}
            <Button onClick={handleSlew} className="w-full" disabled={!mountReady || isSlewing}>
              <Target className="w-4 h-4 mr-2" />
              Slew
            </Button>
            <Button onClick={handleSyncCurrent} variant="outline" className="w-full glass">
              <Repeat className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button onClick={onFlipPierSide} variant="outline" className="w-full glass">
              <FlipHorizontal className="w-4 h-4 mr-2" />
              Flip Pier
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Manual Movement */}
          <div>
            <h4 className="opacity-70 mb-3 flex items-center gap-2"><Move className="w-4 h-4" />Manual Movement</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nudge Controls */}
              <div className="space-y-3">
                <Label>Nudge Telescope</Label>
                <div className="grid grid-cols-3 grid-rows-3 gap-1 w-36 mx-auto glass p-2 rounded-lg">
                  <Button variant="outline" size="icon" className="w-full h-full aspect-square col-start-2 row-start-1" onClick={() => handleNudge('N')}>
                    <ArrowUp />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full h-full aspect-square col-start-1 row-start-2" onClick={() => handleNudge('E')}>
                    <ArrowLeft />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full h-full aspect-square col-start-3 row-start-2" onClick={() => handleNudge('E')}>
                    <ArrowRight />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full h-full aspect-square col-start-2 row-start-3" onClick={() => handleNudge('S')}>
                    <ArrowDown />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Label htmlFor="nudge-duration" className="text-sm opacity-80">Duration (ms)</Label>
                  <Input
                    id="nudge-duration"
                    type="number"
                    step="100"
                    value={nudgeDuration}
                    onChange={(e) => setNudgeDuration(parseInt(e.target.value, 10))}
                    className="glass w-24"
                  />
                </div>
              </div>

              {/* Move Controls */}
              <div className="space-y-3">
                <Label>Move Telescope (Hold)</Label>
                <div className="grid grid-cols-3 grid-rows-3 gap-1 w-36 mx-auto glass p-2 rounded-lg">
                   <Button variant="outline" size="icon" className="w-full h-full aspect-square col-start-2 row-start-1" onPointerDown={() => handleMoveStart('N')} onPointerUp={handleMoveEnd} onPointerLeave={handleMoveEnd}>
                    <ArrowUp />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full h-full aspect-square col-start-1 row-start-2" onPointerDown={() => handleMoveStart('E')} onPointerUp={handleMoveEnd} onPointerLeave={handleMoveEnd}>
                    <ArrowLeft />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full h-full aspect-square col-start-3 row-start-2" onPointerDown={() => handleMoveStart('W')} onPointerUp={handleMoveEnd} onPointerLeave={handleMoveEnd}>
                    <ArrowRight />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full h-full aspect-square col-start-2 row-start-3" onPointerDown={() => handleMoveStart('S')} onPointerUp={handleMoveEnd} onPointerLeave={handleMoveEnd}>
                    <ArrowDown />
                  </Button>
                </div>
                <p className="text-xs opacity-60 text-center pt-2">Press and hold to move</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Halt Controls */}
          <div>
            <h4 className="opacity-70 mb-3 flex items-center gap-2"><XSquare className="w-4 h-4" />Halt Movement</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="destructive" onClick={handleMoveEnd} className="flex-grow">
                <XSquare className="w-4 h-4 mr-2" />
                STOP ALL MOVEMENT
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="glass" onClick={() => handleHaltDirection('N')}>Stop N</Button>
                <Button variant="outline" className="glass" onClick={() => handleHaltDirection('S')}>Stop S</Button>
                <Button variant="outline" className="glass" onClick={() => handleHaltDirection('E')}>Stop E</Button>
                <Button variant="outline" className="glass" onClick={() => handleHaltDirection('W')}>Stop W</Button>
              </div>
            </div>
          </div>







        </div>
      </div>
    </Card>
  );
}
