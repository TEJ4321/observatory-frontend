import { Card } from "./ui/card";
import { Clock, Globe2, Star, Calendar } from "lucide-react";

interface TimeDisplayProps {
  localTime: Date;
  utcTime: Date;
  siderealTime: string;
  julianDate: number;
}

export function TimeDisplay({ localTime, utcTime, siderealTime, julianDate }: TimeDisplayProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-4 md:p-6 glass">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3>Time & Date</h3>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Clock className="w-4 h-4" />
            <span>Local Time</span>
          </div>
          <div className="text-base sm:text-xl tabular-nums">{formatTime(localTime)}</div>
          <div className="opacity-50 mt-1">{formatDate(localTime)}</div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Globe2 className="w-4 h-4" />
            <span>UTC Time</span>
          </div>
          <div className="text-base sm:text-xl tabular-nums">{formatTime(utcTime)}</div>
          <div className="opacity-50 mt-1">{formatDate(utcTime)}</div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Star className="w-4 h-4" />
            <span>Sidereal Time</span>
          </div>
          <div className="text-base sm:text-xl tabular-nums">{siderealTime}</div>
          <div className="opacity-50 mt-1">LST</div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Calendar className="w-4 h-4" />
            <span>Julian Date</span>
          </div>
          <div className="text-base sm:text-xl tabular-nums">{julianDate.toFixed(3)}</div>
          <div className="opacity-50 mt-1">JD</div>
        </div>
      </div>
    </Card>
  );
}
