import { Card } from "./ui/card";

interface TelescopePointingProps {
  ra: number; // Right Ascension in hours
  dec: number; // Declination in degrees
  alt: number; // Altitude in degrees
  az: number; // Azimuth in degrees
}

export function TelescopePointing({ ra, dec, alt, az }: TelescopePointingProps) {
  // Convert coordinates for visualization
  const centerX = 150;
  const centerY = 150;
  const radius = 120;
  
  // Calculate position on Alt/Az chart (altitude from center, azimuth as angle)
  const altRadius = ((90 - alt) / 90) * radius;
  const azRad = (az - 90) * (Math.PI / 180); // Rotate so 0° is at top
  
  const telescopeX = centerX + altRadius * Math.cos(azRad);
  const telescopeY = centerY + altRadius * Math.sin(azRad);
  
  return (
    <Card className="p-4 md:p-6 glass">
      <h3 className="mb-4">Telescope Pointing</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Sky Chart Visualization */}
        <div className="flex flex-col items-center">
          <div className="mb-2 opacity-70">Alt/Az Sky Chart</div>
          <svg viewBox="0 0 300 300" className="w-full max-w-[300px] h-auto border border-border rounded-lg bg-card">
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
            
            {/* Telescope position indicator */}
            <circle cx={telescopeX} cy={telescopeY} r="8" fill="#fbbf24" opacity="0.9" />
            <circle cx={telescopeX} cy={telescopeY} r="12" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.7" />
            <circle cx={telescopeX} cy={telescopeY} r="16" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
            
            {/* Crosshair on telescope position */}
            <line 
              x1={telescopeX - 20} y1={telescopeY} 
              x2={telescopeX + 20} y2={telescopeY} 
              stroke="#fbbf24" strokeWidth="1" opacity="0.5" 
            />
            <line 
              x1={telescopeX} y1={telescopeY - 20} 
              x2={telescopeX} y2={telescopeY + 20} 
              stroke="#fbbf24" strokeWidth="1" opacity="0.5" 
            />
            
            {/* Zenith indicator */}
            <circle cx={centerX} cy={centerY} r="3" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
        
        {/* Coordinate Displays */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="opacity-70 mb-1">Right Ascension</div>
              <div className="text-2xl tabular-nums">{ra.toFixed(4)}h</div>
              <div className="opacity-50 mt-1">
                {Math.floor(ra)}h {Math.floor((ra % 1) * 60)}m {(((ra % 1) * 60) % 1 * 60).toFixed(1)}s
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="opacity-70 mb-1">Declination</div>
              <div className="text-2xl tabular-nums">{dec.toFixed(4)}°</div>
              <div className="opacity-50 mt-1">
                {Math.floor(Math.abs(dec))}° {Math.floor((Math.abs(dec) % 1) * 60)}' {(((Math.abs(dec) % 1) * 60) % 1 * 60).toFixed(1)}"
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="opacity-70 mb-1">Altitude</div>
              <div className="text-2xl tabular-nums">{alt.toFixed(2)}°</div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="opacity-70 mb-1">Azimuth</div>
              <div className="text-2xl tabular-nums">{az.toFixed(2)}°</div>
            </div>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="opacity-70 mb-2">Tracking Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
