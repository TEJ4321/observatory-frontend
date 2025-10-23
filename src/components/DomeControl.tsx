import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button"; 
import { Home, RotateCw, Building2, Link, Link2Off, Target } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";

interface DomeControlProps {
  azimuth: number;
  shutterState: "open" | "closed" | "opening" | "closing" | "unknown";
  isSlaved: boolean;
  isMoving: boolean;
  onToggleSlaving: () => void;
  onSlew: (azimuth: number) => void;
}

export function DomeControl({ azimuth, shutterState, isSlaved, isMoving, onToggleSlaving, onSlew }: DomeControlProps) {
  const getShutterBadgeVariant = () => {
    if (isMoving) return "outline";
    switch (shutterState) {
      case "open": return "default";
      case "closed": return "secondary";
      case "opening":
      case "closing": return "outline";
      default: return "default";
    }
  };

  const [targetAzimuth, setTargetAzimuth] = useState("");

  const handleSlew = () => {
    const target = parseFloat(targetAzimuth);
    if (!isNaN(target)) onSlew(target);
  };
  
  return (
    <Card className="p-4 md:p-6 glass">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h3>Dome Control</h3>
        </div>
        <div className="flex items-center gap-4">
          {isMoving && (
            <Badge variant="default" className="bg-blue-500 flex items-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin" />
              Slewing
            </Badge>
          )}
          <Label htmlFor="dome-slave" className="flex items-center gap-2 cursor-pointer">
            {isSlaved ? <Link className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
            Slave to Scope
          </Label>

          <Switch id="dome-slave" checked={isSlaved} onCheckedChange={() => onToggleSlaving()} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Dome Azimuth Visualizer */}
        <div className="flex flex-col items-center">
          <div className="mb-2 opacity-70">Dome Azimuth</div>
          <svg viewBox="0 0 240 240" className="w-full max-w-[240px] h-auto border border-border rounded-full bg-card">
            <defs>
              <linearGradient id="domeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Dome circle */}
            <circle cx="120" cy="120" r="100" fill="url(#domeGradient)" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
            
            {/* Cardinal direction markers */}
            <line x1="120" y1="10" x2="120" y2="30" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
            <text x="120" y="50" textAnchor="middle" className="fill-foreground" fontSize="14">N</text>
            
            <line x1="120" y1="210" x2="120" y2="230" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
            <text x="120" y="200" textAnchor="middle" className="fill-muted-foreground" fontSize="12">S</text>
            
            <line x1="10" y1="120" x2="30" y2="120" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
            <text x="45" y="125" textAnchor="middle" className="fill-muted-foreground" fontSize="12">W</text>
            
            <line x1="210" y1="120" x2="230" y2="120" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
            <text x="195" y="125" textAnchor="middle" className="fill-muted-foreground" fontSize="12">E</text>
            
            {/* Slit position indicator */}
            {(() => {
              const angle = (azimuth - 90) * (Math.PI / 180);
              const slitLength = 85;
              const x1 = 120 + Math.cos(angle) * 20;
              const y1 = 120 + Math.sin(angle) * 20;
              const x2 = 120 + Math.cos(angle) * slitLength;
              const y2 = 120 + Math.sin(angle) * slitLength;
              
              return (
                <>
                  <line 
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke="#fbbf24" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    opacity={isMoving ? 0.5 : 0.8}
                    className={isMoving ? "animate-pulse" : ""}
                  />
                  <circle cx={x2} cy={y2} r="6" fill="#fbbf24" />
                </>
              );
            })()}
            
            {/* Center point */}
            <circle cx="120" cy="120" r="4" fill="currentColor" opacity="0.3" />
          </svg>
          
          <div className="mt-4 text-2xl sm:text-3xl tabular-nums">{azimuth.toFixed(1)}°</div>
        </div>
        
        {/* Shutter Status and Controls */}
        <div className="space-y-4">
          <div className="p-4 bg-muted/40 rounded-lg glass backdrop-blur-md">
            <div className="opacity-70 mb-2">Shutter Status</div>
            <div className="flex items-center gap-3">
              <Badge variant={getShutterBadgeVariant()} className="text-base px-3 py-1">
                {shutterState.charAt(0).toUpperCase() + shutterState.slice(1)}
              </Badge>
              {(shutterState === "opening" || shutterState === "closing" || isMoving) && (
                <RotateCw className="w-4 h-4 animate-spin" />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" disabled={shutterState === "opening" || shutterState === "open"}>
              Open Shutter
            </Button>
            <Button variant="outline" className="w-full" disabled={shutterState === "closing" || shutterState === "closed"}>
              Close Shutter
            </Button>
          </div>
          
          <div className="pt-4 space-y-3 border-t border-border">
            <Label htmlFor="dome-target">Slew to Azimuth</Label>
            <div className="flex gap-2">
              <Input
                id="dome-target"
                type="number"
                placeholder="e.g. 180"
                value={targetAzimuth}
                onChange={(e) => setTargetAzimuth(e.target.value)}
                className="glass"
                disabled={isMoving}
              />
              <Button onClick={handleSlew} disabled={isMoving || !targetAzimuth}>
                <Target className="w-4 h-4 mr-2" />
                Slew
              </Button>
            </div>
          </div>


          
          <div className="pt-2 border-t border-border">
            <div className="opacity-70 mb-3">Dome Control</div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" size="sm">
                <RotateCw className="w-4 h-4 mr-2" />
                Sync
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
