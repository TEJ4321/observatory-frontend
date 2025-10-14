import { Card } from "./ui/card";
import { MapPin } from "lucide-react";

interface ObservatoryLocationProps {
  latitude: number;
  longitude: number;
  elevation: number;
  siteName: string;
}

export function ObservatoryLocation({ latitude, longitude, elevation, siteName }: ObservatoryLocationProps) {
  // Simple Earth globe visualization
  const renderEarthGlobe = () => {
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    
    // Calculate position on globe
    const latRad = (latitude * Math.PI) / 180;
    const lonRad = (longitude * Math.PI) / 180;
    
    // Simple orthographic projection
    const x = centerX + radius * Math.cos(latRad) * Math.sin(lonRad);
    const y = centerY - radius * Math.sin(latRad);
    
    return (
      <svg viewBox="0 0 200 200" className="w-full max-w-[200px] h-auto">
        {/* Earth */}
        <defs>
          <radialGradient id="earthGradient">
            <stop offset="0%" stopColor="#4299e1" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#2b6cb0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1a365d" stopOpacity="1" />
          </radialGradient>
        </defs>
        
        <circle cx={centerX} cy={centerY} r={radius} fill="url(#earthGradient)" opacity="0.9" />
        
        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map(lat => {
          const latY = centerY - radius * Math.sin((lat * Math.PI) / 180);
          const latRadius = radius * Math.cos((lat * Math.PI) / 180);
          return (
            <ellipse
              key={lat}
              cx={centerX}
              cy={latY}
              rx={latRadius}
              ry={latRadius * 0.3}
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Longitude lines */}
        {[0, 60, 120, 180, 240, 300].map(lon => (
          <ellipse
            key={lon}
            cx={centerX}
            cy={centerY}
            rx={radius * 0.3}
            ry={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
            transform={`rotate(${lon} ${centerX} ${centerY})`}
          />
        ))}
        
        {/* Observatory location marker */}
        <circle cx={x} cy={y} r="6" fill="#fbbf24" opacity="0.9" className="animate-pulse"/>
        <circle cx={x} cy={y} r="10" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.7" className="animate-pulse"/>
        <circle cx={x} cy={y} r="14" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.4" className="animate-pulse"/>
      </svg>
    );
  };

  return (
    <Card className="p-4 md:p-6 glass-strong">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3>Observatory Location</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center">
          {renderEarthGlobe()}
          <p className="mt-3 opacity-70">{siteName}</p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
            <div className="opacity-70 mb-1">Latitude</div>
            <div className="text-xl tabular-nums">
              {Math.abs(latitude).toFixed(6)}° {latitude >= 0 ? 'N' : 'S'}
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
            <div className="opacity-70 mb-1">Longitude</div>
            <div className="text-xl tabular-nums">
              {Math.abs(longitude).toFixed(6)}° {longitude >= 0 ? 'E' : 'W'}
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
            <div className="opacity-70 mb-1">Elevation</div>
            <div className="text-xl tabular-nums">{elevation.toFixed(0)} m</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
