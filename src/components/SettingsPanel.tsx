import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Globe, Mountain, Telescope, Settings2, Camera, Wifi } from "lucide-react";

export interface ObservatorySettings {
  // Observatory Location
  latitude: number;
  longitude: number;
  elevation: number;
  siteName: string;

  // Dome Configuration
  domeRadius: number;
  domeCenterX: number;
  domeCenterY: number;
  domeCenterZ: number;

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

  // API Configuration
  apiBaseUrl: string;
  pollingInterval: number;
  useWebSocket: boolean;

  // Camera Configuration
  telescopeCameraUrl: string;
  cctvCameraUrl: string;
  cameraRefreshRate: number;
}

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ObservatorySettings;
  onSettingsChange: (settings: ObservatorySettings) => void;
}

export function SettingsPanel({ open, onOpenChange, settings, onSettingsChange }: SettingsPanelProps) {
  const handleChange = (key: keyof ObservatorySettings, value: string | number | boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl glass-strong">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Observatory Settings
          </SheetTitle>
          <SheetDescription>
            Configure observatory parameters, mount geometry, and API connections
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
          <Tabs defaultValue="location" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass">
              <TabsTrigger value="location">
                <Globe className="w-4 h-4 mr-2" />
                Location
              </TabsTrigger>
              <TabsTrigger value="mount">
                <Telescope className="w-4 h-4 mr-2" />
                Mount
              </TabsTrigger>
              <TabsTrigger value="api">
                <Wifi className="w-4 h-4 mr-2" />
                API
              </TabsTrigger>
            </TabsList>

            {/* Location & Dome Tab */}
            <TabsContent value="location" className="space-y-6 mt-4">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 opacity-90">
                  <Globe className="w-4 h-4" />
                  Observatory Location
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (degrees)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.0000001"
                      value={settings.latitude}
                      onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                      className="glass"
                    />
                    <p className="text-xs opacity-60">Positive = North, Negative = South</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude (degrees)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0000001"
                      value={settings.longitude}
                      onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                      className="glass"
                    />
                    <p className="text-xs opacity-60">Positive = East, Negative = West</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="elevation">Elevation (meters)</Label>
                    <Input
                      id="elevation"
                      type="number"
                      step="1"
                      value={settings.elevation}
                      onChange={(e) => handleChange('elevation', parseFloat(e.target.value))}
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => handleChange('siteName', e.target.value)}
                      className="glass"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 opacity-90">
                  <Mountain className="w-4 h-4" />
                  Dome Configuration
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="domeRadius">Dome Radius (units)</Label>
                    <Input
                      id="domeRadius"
                      type="number"
                      step="1"
                      value={settings.domeRadius}
                      onChange={(e) => handleChange('domeRadius', parseFloat(e.target.value))}
                      className="glass"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="domeCenterX">Center X</Label>
                      <Input
                        id="domeCenterX"
                        type="number"
                        step="1"
                        value={settings.domeCenterX}
                        onChange={(e) => handleChange('domeCenterX', parseFloat(e.target.value))}
                        className="glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domeCenterY">Center Y</Label>
                      <Input
                        id="domeCenterY"
                        type="number"
                        step="1"
                        value={settings.domeCenterY}
                        onChange={(e) => handleChange('domeCenterY', parseFloat(e.target.value))}
                        className="glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domeCenterZ">Center Z</Label>
                      <Input
                        id="domeCenterZ"
                        type="number"
                        step="1"
                        value={settings.domeCenterZ}
                        onChange={(e) => handleChange('domeCenterZ', parseFloat(e.target.value))}
                        className="glass"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Mount & Telescope Tab */}
            <TabsContent value="mount" className="space-y-6 mt-4">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 opacity-90">
                  <Telescope className="w-4 h-4" />
                  Mount Configuration
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="pierHeight">Pier Height (units)</Label>
                    <Input
                      id="pierHeight"
                      type="number"
                      step="1"
                      value={settings.pierHeight}
                      onChange={(e) => handleChange('pierHeight', parseFloat(e.target.value))}
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pierRadius">Pier Radius (units)</Label>
                    <Input
                      id="pierRadius"
                      type="number"
                      step="0.1"
                      value={settings.pierRadius}
                      onChange={(e) => handleChange('pierRadius', parseFloat(e.target.value))}
                      className="glass"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="mountOffsetX">Mount Offset X</Label>
                      <Input
                        id="mountOffsetX"
                        type="number"
                        step="1"
                        value={settings.mountOffsetX}
                        onChange={(e) => handleChange('mountOffsetX', parseFloat(e.target.value))}
                        className="glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mountOffsetZ">Mount Offset Z</Label>
                      <Input
                        id="mountOffsetZ"
                        type="number"
                        step="1"
                        value={settings.mountOffsetZ}
                        onChange={(e) => handleChange('mountOffsetZ', parseFloat(e.target.value))}
                        className="glass"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="raAxisLength">RA Axis Length</Label>
                      <Input
                        id="raAxisLength"
                        type="number"
                        step="1"
                        value={settings.raAxisLength}
                        onChange={(e) => handleChange('raAxisLength', parseFloat(e.target.value))}
                        className="glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="decAxisLength">Dec Axis Length</Label>
                      <Input
                        id="decAxisLength"
                        type="number"
                        step="1"
                        value={settings.decAxisLength}
                        onChange={(e) => handleChange('decAxisLength', parseFloat(e.target.value))}
                        className="glass"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="opacity-90">Telescope Configuration</h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="tubeLength">Tube Length (units)</Label>
                    <Input
                      id="tubeLength"
                      type="number"
                      step="1"
                      value={settings.tubeLength}
                      onChange={(e) => handleChange('tubeLength', parseFloat(e.target.value))}
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tubeRadius">Tube Radius (units)</Label>
                    <Input
                      id="tubeRadius"
                      type="number"
                      step="0.1"
                      value={settings.tubeRadius}
                      onChange={(e) => handleChange('tubeRadius', parseFloat(e.target.value))}
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="counterweightShaftLength">Counterweight Shaft Length</Label>
                    <Input
                      id="counterweightShaftLength"
                      type="number"
                      step="1"
                      value={settings.counterweightShaftLength}
                      onChange={(e) => handleChange('counterweightShaftLength', parseFloat(e.target.value))}
                      className="glass"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* API & Camera Tab */}
            <TabsContent value="api" className="space-y-6 mt-4">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 opacity-90">
                  <Wifi className="w-4 h-4" />
                  API Configuration
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="apiBaseUrl">API Base URL</Label>
                    <Input
                      id="apiBaseUrl"
                      type="text"
                      value={settings.apiBaseUrl}
                      onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
                      className="glass"
                      placeholder="http://localhost:8000/api"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pollingInterval">Polling Interval (ms)</Label>
                    <Input
                      id="pollingInterval"
                      type="number"
                      step="100"
                      value={settings.pollingInterval}
                      onChange={(e) => handleChange('pollingInterval', parseFloat(e.target.value))}
                      className="glass"
                    />
                    <p className="text-xs opacity-60">How often to fetch data (if not using WebSocket)</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useWebSocket"
                      checked={settings.useWebSocket}
                      onChange={(e) => handleChange('useWebSocket', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="useWebSocket" className="cursor-pointer">
                      Use WebSocket for real-time updates
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 opacity-90">
                  <Camera className="w-4 h-4" />
                  Camera Configuration
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="telescopeCameraUrl">Telescope Camera URL</Label>
                    <Input
                      id="telescopeCameraUrl"
                      type="text"
                      value={settings.telescopeCameraUrl}
                      onChange={(e) => handleChange('telescopeCameraUrl', e.target.value)}
                      className="glass"
                      placeholder="http://localhost:8000/camera/telescope"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cctvCameraUrl">CCTV Camera URL</Label>
                    <Input
                      id="cctvCameraUrl"
                      type="text"
                      value={settings.cctvCameraUrl}
                      onChange={(e) => handleChange('cctvCameraUrl', e.target.value)}
                      className="glass"
                      placeholder="http://localhost:8000/camera/cctv"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cameraRefreshRate">Camera Refresh Rate (seconds)</Label>
                    <Input
                      id="cameraRefreshRate"
                      type="number"
                      step="1"
                      value={settings.cameraRefreshRate}
                      onChange={(e) => handleChange('cameraRefreshRate', parseFloat(e.target.value))}
                      className="glass"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="glass">
              Cancel
            </Button>
            <Button onClick={() => {
              // Save settings to localStorage
              localStorage.setItem('observatorySettings', JSON.stringify(settings));
              onOpenChange(false);
            }}>
              Save Settings
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
