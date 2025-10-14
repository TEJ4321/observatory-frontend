import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Activity, Wifi, HardDrive, Cpu, Thermometer, Server, Timer } from "lucide-react";

interface SystemStatusProps {
  connectionStatus: "connected" | "disconnected" | "error";
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  apiLatency: number;
  systemTemp: number;
  uptime: string;
}

export function SystemStatus({ connectionStatus, cpuUsage, memoryUsage, diskUsage, apiLatency, systemTemp, uptime }: SystemStatusProps) {
  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return <Badge variant="default" className="bg-green-500"><Wifi className="w-3 h-3 mr-1" />Connected</Badge>;
      case "disconnected":
        return <Badge variant="secondary"><Wifi className="w-3 h-3 mr-1" />Disconnected</Badge>;
      case "error":
        return <Badge variant="destructive"><Wifi className="w-3 h-3 mr-1" />Error</Badge>;
    }
  };
  
  const getUsageColor = (usage: number) => {
    if (usage < 50) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <Card className="p-4 md:p-6 glass">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          <h3>System Status</h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="p-3 glass rounded-lg">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Cpu className="w-4 h-4" />
            <span>CPU</span>
          </div>
          <div className="tabular-nums">{cpuUsage.toFixed(1)}%</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getUsageColor(
                cpuUsage
              )}`}
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        <div className="p-3 glass rounded-lg">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Activity className="w-4 h-4" />
            <span>Memory</span>
          </div>
          <div className="tabular-nums">{memoryUsage.toFixed(1)}%</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getUsageColor(
                memoryUsage
              )}`}
              style={{ width: `${memoryUsage}%` }}
            />
          </div>
        </div>

        <div className="p-3 glass rounded-lg">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <HardDrive className="w-4 h-4" />
            <span>Disk</span>
          </div>
          <div className="tabular-nums">{diskUsage.toFixed(1)}%</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getUsageColor(
                diskUsage
              )}`}
              style={{ width: `${diskUsage}%` }}
            />
          </div>
        </div>

        <div className="p-3 glass rounded-lg">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Wifi className="w-4 h-4" />
            <span>Latency</span>
          </div>
          <div className="tabular-nums">{Math.round(apiLatency)}ms</div>
        </div>

        <div className="p-3 glass rounded-lg">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Thermometer className="w-4 h-4" />
            <span>System Temp</span>
          </div>
          <div className="tabular-nums">{systemTemp.toFixed(0)}°C</div>
        </div>

        <div className="p-3 glass rounded-lg">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Timer className="w-4 h-4" />
            <span className="text-sm">Uptime</span>
          </div>
          <div className="tabular-nums">{uptime}</div>
        </div>
      </div>
    </Card>
  );
}
