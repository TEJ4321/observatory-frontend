import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Target, Navigation, Repeat, FlipHorizontal } from "lucide-react";
import { useState } from "react";

interface TelescopeControlProps {
  currentRA: number;
  currentDec: number;
  currentAlt: number;
  currentAz: number;
  isTracking: boolean;
  pierSide: "East" | "West";
  onSetTarget: (coords: { ra?: number; dec?: number; alt?: number; az?: number }) => void;
  onToggleTracking: () => void;
  onFlipPierSide: () => void;
}

export function TelescopeControl({
  currentRA,
  currentDec,
  currentAlt,
  currentAz,
  isTracking,
  pierSide,
  onSetTarget,
  onToggleTracking,
  onFlipPierSide
}: TelescopeControlProps) {
  const [coordType, setCoordType] = useState<"equatorial" | "altaz">("equatorial");
  const [targetRA, setTargetRA] = useState("");
  const [targetDec, setTargetDec] = useState("");
  const [targetAlt, setTargetAlt] = useState("");
  const [targetAz, setTargetAz] = useState("");

  const handleSlew = () => {
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

  return (
    <Card className="p-4 md:p-6 glass-strong">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3>Telescope Control</h3>
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
              <p className="opacity-60">Current: {currentRA.toFixed(4)}h</p>
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
              <p className="opacity-60">Current: {currentDec.toFixed(4)}°</p>
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
              <p className="opacity-60">Current: {currentAlt.toFixed(2)}°</p>
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
              <p className="opacity-60">Current: {currentAz.toFixed(2)}°</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        <Button onClick={handleSlew} className="w-full">
          <Target className="w-4 h-4 mr-2" />
          Slew
        </Button>
        <Button onClick={handleSyncCurrent} variant="outline" className="w-full glass">
          <Repeat className="w-4 h-4 mr-2" />
          Sync Current
        </Button>
        <Button onClick={onFlipPierSide} variant="outline" className="w-full glass">
          <FlipHorizontal className="w-4 h-4 mr-2" />
          Flip Pier
        </Button>
      </div>
    </Card>
  );
}
