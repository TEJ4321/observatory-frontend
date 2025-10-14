import { Card } from "./ui/card";
import { Cloud, CloudRain, Droplets, Eye, Moon, Sun, Thermometer, Wind } from "lucide-react";
import { Badge } from "./ui/badge";

interface WeatherConditionsProps {
  temperature: number;
  humidity: number;
  precipitation: number;
  cloudCover: number;
  moonPhase: number; // 0-1, where 0 is new moon, 0.5 is full moon
  seeingConditions: string;
  lightPollution: number; // Bortle scale 1-9
  windSpeed: number;
  windDirection: number;
  dewPoint: number;
  pressure: number;
}

export function WeatherConditions({
  temperature,
  humidity,
  precipitation,
  cloudCover,
  moonPhase,
  seeingConditions,
  lightPollution,
  windSpeed,
  windDirection,
  dewPoint,
  pressure
}: WeatherConditionsProps) {
  const getMoonPhaseIcon = () => {
    if (moonPhase < 0.05 || moonPhase > 0.95) return "🌑"; // New Moon
    if (moonPhase < 0.2) return "🌒"; // Waxing Crescent
    if (moonPhase < 0.3) return "🌓"; // First Quarter
    if (moonPhase < 0.45) return "🌔"; // Waxing Gibbous
    if (moonPhase < 0.55) return "🌕"; // Full Moon
    if (moonPhase < 0.7) return "🌖"; // Waning Gibbous
    if (moonPhase < 0.8) return "🌗"; // Last Quarter
    return "🌘"; // Waning Crescent
  };

  const getMoonPhaseName = () => {
    if (moonPhase < 0.05 || moonPhase > 0.95) return "New Moon";
    if (moonPhase < 0.2) return "Waxing Crescent";
    if (moonPhase < 0.3) return "First Quarter";
    if (moonPhase < 0.45) return "Waxing Gibbous";
    if (moonPhase < 0.55) return "Full Moon";
    if (moonPhase < 0.7) return "Waning Gibbous";
    if (moonPhase < 0.8) return "Last Quarter";
    return "Waning Crescent";
  };

  const getBortleDescription = () => {
    if (lightPollution <= 2) return "Excellent";
    if (lightPollution <= 4) return "Good";
    if (lightPollution <= 6) return "Moderate";
    return "Poor";
  };

  const getSeeingColor = () => {
    switch (seeingConditions) {
      case "Excellent": return "bg-green-500";
      case "Good": return "bg-blue-500";
      case "Fair": return "bg-yellow-500";
      case "Poor": return "bg-red-500";
    }
  };

  const getWindDirection = () => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(windDirection / 22.5) % 16;
    return directions[index];
  };

  return (
    <Card className="p-4 md:p-6 glass-strong">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-5 h-5 text-primary" />
        <h3>Weather Conditions</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Temperature */}
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <Thermometer className="w-4 h-4" />
            <span className="text-sm">Temperature</span>
          </div>
          <div className="text-lg tabular-nums">{temperature.toFixed(1)}°C</div>
        </div>

        {/* Humidity */}
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <Droplets className="w-4 h-4" />
            <span className="text-sm">Humidity</span>
          </div>
          <div className="text-lg tabular-nums">{humidity.toFixed(0)}%</div>
        </div>

        {/* Precipitation */}
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <CloudRain className="w-4 h-4" />
            <span className="text-sm">Precipitation</span>
          </div>
          <div className="text-lg tabular-nums">{precipitation.toFixed(1)}%</div>
        </div>

        {/* Cloud Cover */}
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <Cloud className="w-4 h-4" />
            <span className="text-sm">Cloud Cover</span>
          </div>
          <div className="text-lg tabular-nums">{cloudCover.toFixed(0)}%</div>
        </div>

        {/* Wind */}
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <Wind className="w-4 h-4" />
            <span className="text-sm">Wind</span>
          </div>
          <div className="text-lg">
            {windSpeed.toFixed(1)} km/h {getWindDirection()}
          </div>
        </div>

        {/* Dew Point */}
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <Droplets className="w-4 h-4" />
            <span className="text-sm">Dew Point</span>
          </div>
          <div className="text-lg tabular-nums">{dewPoint.toFixed(1)}°C</div>
        </div>

        {/* Pressure */}
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <Cloud className="w-4 h-4" />
            <span className="text-sm">Pressure</span>
          </div>
          <div className="text-lg tabular-nums">{pressure.toFixed(0)} hPa</div>
        </div>

        {/* Moon Phase */}
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1 opacity-70">
            <Moon className="w-4 h-4" />
            <span className="text-sm">Moon Phase</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getMoonPhaseIcon()}</span>
            <span className="text-sm">{getMoonPhaseName()}</span>
          </div>
        </div>
      </div>

      {/* Observing Conditions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Seeing Conditions</span>
          </div>
          <Badge className={`${getSeeingColor()} text-white`}>
            {seeingConditions}
          </Badge>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Sun className="w-4 h-4" />
            <span className="text-sm">Light Pollution (Bortle)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg tabular-nums">Class {lightPollution}</span>
            <span className="opacity-70">({getBortleDescription()})</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
