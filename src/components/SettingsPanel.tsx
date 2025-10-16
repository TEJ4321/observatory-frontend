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
  // Pier
  pierHeight: number;
  pierDiameter: number;
  pierElevatorHeight: number;
  pierElevatorTopDiameter: number;
  pierElevatorBottomDiameter: number;

  // Mount Base
  mountBaseDiskThickness: number;
  mountBaseDiskDiameter: number;
  mountBaseHolderHeight: number;
  mountBaseHolderThickness: number;
  mountBasePolarAxisHeight: number;
  mountBasePolarAxisBoltDiameter: number;
  mountBasePolarAxisBoltThickness: number;

  // Mount Polar Axis (RA)
  polarAxisLengthHolderSide: number;
  polarAxisDiameterHolderSide: number;
  polarAxisPositionHolderSide: number;
  polarAxisLengthMotorSideFull: number;
  polarAxisLengthMotorSideThick: number;
  polarAxisDiameterMotorSide: number;

  // Declination Axis
  decAxisLengthMain: number;
  decAxisDiameterMain: number;
  decAxisPositionMain: number;
  decAxisLengthMotor: number;
  decAxisDiameterMotor: number;

  // Counterweight
  cwShaftDiameter: number;
  cwShaftLength: number;
  cwEndCapDiameter: number;
  cwEndCapThickness: number;
  // Note: cwWeights is complex and not editable in this panel for now.

  // Telescope Tube
  tubeLength: number;
  tubeDiameter: number;
  tubePivotPos: number;
  tubeSensorAreaLength: number;
  tubeSensorAreaDiameter: number;
  tubeSecondaryTubeLength: number;
  tubeSecondaryTubeDiameter: number;
  tubeSecondaryTubeOffsetRadial: number;
  tubeSecondaryTubeOffsetAxial: number;

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
              {/* Pier Section */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 opacity-90">
                  <Mountain className="w-4 h-4" />
                  Pier Configuration
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <InputWithLabel id="pierHeight" label="Pier Height" value={settings.pierHeight} onChange={handleChange} />
                  <InputWithLabel id="pierDiameter" label="Pier Diameter" value={settings.pierDiameter} onChange={handleChange} />
                  <InputWithLabel id="pierElevatorHeight" label="Elevator Height" value={settings.pierElevatorHeight} onChange={handleChange} />
                  <InputWithLabel id="pierElevatorTopDiameter" label="Elevator Top Dia." value={settings.pierElevatorTopDiameter} onChange={handleChange} />
                  <InputWithLabel id="pierElevatorBottomDiameter" label="Elevator Bottom Dia." value={settings.pierElevatorBottomDiameter} onChange={handleChange} />
                </div>
              </div>

              <Separator />

              {/* Mount Base Section */}
              <div className="space-y-4">
                <h4 className="opacity-90">Mount Base</h4>
                <div className="grid grid-cols-2 gap-3">
                  <InputWithLabel id="mountBaseDiskThickness" label="Disk Thickness" value={settings.mountBaseDiskThickness} onChange={handleChange} />
                  <InputWithLabel id="mountBaseDiskDiameter" label="Disk Diameter" value={settings.mountBaseDiskDiameter} onChange={handleChange} />
                  <InputWithLabel id="mountBaseHolderHeight" label="Holder Height" value={settings.mountBaseHolderHeight} onChange={handleChange} />
                  <InputWithLabel id="mountBaseHolderThickness" label="Holder Thickness" value={settings.mountBaseHolderThickness} onChange={handleChange} />
                  <InputWithLabel id="mountBasePolarAxisHeight" label="Polar Axis Height" value={settings.mountBasePolarAxisHeight} onChange={handleChange} />
                  <InputWithLabel id="mountBasePolarAxisBoltDiameter" label="Bolt Diameter" value={settings.mountBasePolarAxisBoltDiameter} onChange={handleChange} />
                  <InputWithLabel id="mountBasePolarAxisBoltThickness" label="Bolt Thickness" value={settings.mountBasePolarAxisBoltThickness} onChange={handleChange} />
                </div>
              </div>

              <Separator />

              {/* Polar Axis Section */}
              <div className="space-y-4">
                <h4 className="opacity-90">Polar (RA) Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <InputWithLabel id="polarAxisLengthHolderSide" label="Holder Side Length" value={settings.polarAxisLengthHolderSide} onChange={handleChange} />
                  <InputWithLabel id="polarAxisDiameterHolderSide" label="Holder Side Dia." value={settings.polarAxisDiameterHolderSide} onChange={handleChange} />
                  <InputWithLabel id="polarAxisPositionHolderSide" label="Holder Side Pos" value={settings.polarAxisPositionHolderSide} onChange={handleChange} />
                  <InputWithLabel id="polarAxisLengthMotorSideFull" label="Motor Side Full Len" value={settings.polarAxisLengthMotorSideFull} onChange={handleChange} />
                  <InputWithLabel id="polarAxisLengthMotorSideThick" label="Motor Side Thick Len" value={settings.polarAxisLengthMotorSideThick} onChange={handleChange} />
                  <InputWithLabel id="polarAxisDiameterMotorSide" label="Motor Side Dia." value={settings.polarAxisDiameterMotorSide} onChange={handleChange} />
                </div>
              </div>

              <Separator />

              {/* Declination Axis Section */}
              <div className="space-y-4">
                <h4 className="opacity-90">Declination (DEC) Axis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <InputWithLabel id="decAxisLengthMain" label="Main Length" value={settings.decAxisLengthMain} onChange={handleChange} />
                  <InputWithLabel id="decAxisDiameterMain" label="Main Diameter" value={settings.decAxisDiameterMain} onChange={handleChange} />
                  <InputWithLabel id="decAxisPositionMain" label="Main Position" value={settings.decAxisPositionMain} onChange={handleChange} />
                  <InputWithLabel id="decAxisLengthMotor" label="Motor Length" value={settings.decAxisLengthMotor} onChange={handleChange} />
                  <InputWithLabel id="decAxisDiameterMotor" label="Motor Diameter" value={settings.decAxisDiameterMotor} onChange={handleChange} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 opacity-90">
                  <Telescope className="w-4 h-4" />
                  Telescope & Counterweight
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Telescope */}
                  <InputWithLabel id="tubeLength" label="Tube Length" value={settings.tubeLength} onChange={handleChange} />
                  <InputWithLabel id="tubeDiameter" label="Tube Diameter" value={settings.tubeDiameter} onChange={handleChange} />
                  <InputWithLabel id="tubePivotPos" label="Tube Pivot Pos" value={settings.tubePivotPos} onChange={handleChange} />
                  <InputWithLabel id="tubeSensorAreaLength" label="Sensor Area Length" value={settings.tubeSensorAreaLength} onChange={handleChange} />
                  <InputWithLabel id="tubeSensorAreaDiameter" label="Sensor Area Dia." value={settings.tubeSensorAreaDiameter} onChange={handleChange} />
                  <InputWithLabel id="tubeSecondaryTubeLength" label="Secondary Tube Len" value={settings.tubeSecondaryTubeLength} onChange={handleChange} />
                  <InputWithLabel id="tubeSecondaryTubeDiameter" label="Secondary Tube Dia." value={-settings.tubeSecondaryTubeDiameter} onChange={handleChange} />
                  <InputWithLabel id="tubeSecondaryTubeOffsetRadial" label="Secondary Radial Offset" value={settings.tubeSecondaryTubeOffsetRadial} onChange={handleChange} />
                  <InputWithLabel id="tubeSecondaryTubeOffsetAxial" label="Secondary Axial Offset" value={settings.tubeSecondaryTubeOffsetAxial} onChange={handleChange} />
                  
                  {/* Counterweight */}
                  <InputWithLabel id="cwShaftLength" label="CW Shaft Length" value={settings.cwShaftLength} onChange={handleChange} />
                  <InputWithLabel id="cwShaftDiameter" label="CW Shaft Diameter" value={settings.cwShaftDiameter} onChange={handleChange} />
                  <InputWithLabel id="cwEndCapDiameter" label="CW End Cap Dia." value={settings.cwEndCapDiameter} onChange={handleChange} />
                  <InputWithLabel id="cwEndCapThickness" label="CW End Cap Thick." value={settings.cwEndCapThickness} onChange={handleChange} />
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

interface InputWithLabelProps {
  id: keyof ObservatorySettings;
  label: string;
  value: string | number;
  onChange: (key: keyof ObservatorySettings, value: string | number | boolean) => void;
}

const InputWithLabel = ({ id, label, value, onChange }: InputWithLabelProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type="number"
      step="0.01"
      value={value}
      onChange={(e) => onChange(id, parseFloat(e.target.value))}
      className="glass"
    />
  </div>
);
