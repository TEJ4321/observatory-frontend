import { Card } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Thermometer, Cpu, MemoryStick, TvMinimal, Cog, CircuitBoard, Microchip} from "lucide-react";
import { ReactElement } from "react";

interface TemperaturesProps {
  motorRaAz: number | null;
  motorDecAlt: number | null;
  motorRaAzDriver: number | null;
  motorDecAltDriver: number | null;
  electronicsBox: number | null;
  keypadDisplay: number | null;
  keypadPcb: number | null;
  keypadController: number | null;
  history: Array<{
    time: string;
    [key: string]: number | string | null;
  }>;
}

const tempConfig: { [key: string]: { label: string; color: string; icon: ReactElement } } = {
  motorRaAz: { label: "RA/Az Motor", color: "#3b82f6", icon: <Cog className="w-4 h-4 opacity-70" /> },
  motorDecAlt: { label: "Dec/Alt Motor", color: "#22c55e", icon: <Cog className="w-4 h-4 opacity-70" /> },
  motorRaAzDriver: { label: "RA/Az Driver", color: "#ef4444", icon: <Cpu className="w-4 h-4 opacity-70" /> },
  motorDecAltDriver: { label: "Dec/Alt Driver", color: "#f97316", icon: <Cpu className="w-4 h-4 opacity-70" /> },
  electronicsBox: { label: "Electronics Box", color: "#a855f7", icon: <MemoryStick className="w-4 h-4 opacity-70" /> },
  keypadDisplay: { label: "Keypad Display", color: "#ec4899", icon: <TvMinimal className="w-4 h-4 opacity-70" /> },
  keypadPcb: { label: "Keypad PCB", color: "#84cc16", icon: <CircuitBoard className="w-4 h-4 opacity-70" /> },
  keypadController: { label: "Keypad CPU", color: "#14b8a6", icon: <Microchip className="w-4 h-4 opacity-70" /> },
};

export function Temperatures(props: TemperaturesProps) {
  const { history, ...currentTemps } = props;

  const availableTemps = Object.entries(currentTemps).filter(
    ([, value]) => value !== null
  ) as [string, number][];

  const getTempColor = (temp: number) => {
    if (temp < 30) return "text-blue-500";
    if (temp < 45) return "text-green-500";
    if (temp < 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  return (
    <Card className="p-4 md:p-6 glass">
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="w-5 h-5 text-primary" />
        <h3>Temperatures</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {availableTemps.length > 0 ? (
          availableTemps.map(([key, temp]) => (
            <div key={key} className="p-3 bg-muted/50 rounded-lg glass backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                {tempConfig[key]?.icon}
                <span className="opacity-70 text-sm">{tempConfig[key]?.label || key}</span>
              </div>
              <div className={`text-2xl tabular-nums ${getTempColor(temp)}`}>
                {temp.toFixed(1)}°C
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-4 text-muted-foreground">
            Waiting for temperature data...
          </div>
        )}
      </div>
      
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fontSize: 12 }} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--popover)', 
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {Object.keys(tempConfig).map(key => (
              <Line key={key} type="monotone" dataKey={key} name={tempConfig[key].label} stroke={tempConfig[key].color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
