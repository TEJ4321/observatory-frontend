import { useState, useEffect, useCallback } from "react";
import { Temperatures } from "./components/Temperatures";
import { DomeControl } from "./components/DomeControl";
import { CameraFeeds } from "./components/CameraFeeds";
import { SystemStatus } from "./components/SystemStatus";
import { MountVisualizer3D } from "./components/MountVisualizer3D";
import { TimeDisplay } from "./components/TimeDisplay";
import { ObservatoryLocation } from "./components/ObservatoryLocation";
import { TelescopePointingControl } from "./components/TelescopePointingControl";
import { WeatherConditions } from "./components/WeatherConditions";
import { SettingsPanel, ObservatorySettings } from "./components/SettingsPanel";
import { Telescope, Settings, Moon, Sun, Loader2, Info } from "lucide-react";
import * as api from "./services/api";
import { Button } from "./components/ui/button";
import { getGPUTier } from "detect-gpu";

// The overall observatory state
interface ObservatoryState {
  telescope: {
    ra: number;
    dec: number;
    alt: number;
    az: number;
    isTracking: boolean;
    mountReady: boolean;
    pierSide: 'West' | 'East' | string;
    status: string;
  };
  time: {
    localTime: Date;
    utcTime: Date;
    siderealTime: string;
    julianDate: number;
  };
  observatory: {
    latitude: number;
    longitude: number;
    elevation: number;
    siteName: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    precipitation: number;
    cloudCover: number;
    moonPhase: number;
    seeingConditions: string;
    lightPollution: number;
    windSpeed: number;
    windDirection: number;
    dewPoint: number;
    pressure: number;
  };
  motors: {
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
  };
  dome: {
    azimuth: number;
    shutterState: "open" | "closed" | "opening" | "closing" | "unknown";
    isSlaved: boolean;
    isMoving: boolean;
  };
  cameras: {
    telescopeCameraUrl: string;
    cctvCameraUrl: string;
    lastExposure: {
      duration: number;
      filter: string;
      timestamp: string;
    };
  };
  system: {
    connectionStatus: "connected" | "disconnected" | "error";
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    apiLatency: number;
    systemTemp: number;
    uptime: string;
  };
}

// Initial empty state for the application data
const initialData: ObservatoryState = {
  telescope: {
    ra: 0,
    dec: 0,
    alt: 0,
    az: 0,
    isTracking: false,
    mountReady: false,
    pierSide: 'Unknown',
    status: 'Unknown',
  },
  time: {
    localTime: new Date(),
    utcTime: new Date(),
    siderealTime: "00:00:00",
    julianDate: 0,
  },
  observatory: {
    latitude: 0,
    longitude: 0,
    elevation: 0,
    siteName: "Loading...",
  },
  weather: {
    temperature: 0,
    humidity: 0,
    precipitation: 0,
    cloudCover: 0,
    moonPhase: 0,
    seeingConditions: "N/A",
    lightPollution: 0,
    windSpeed: 0,
    windDirection: 0,
    dewPoint: 0,
    pressure: 0,
  },
  motors: {
    motorRaAz: null,
    motorDecAlt: null,
    motorRaAzDriver: null,
    motorDecAltDriver: null,
    electronicsBox: null,
    keypadDisplay: null,
    keypadPcb: null,
    keypadController: null,
    history: [],
  },
  dome: {
    azimuth: 0,
    shutterState: "unknown",
    isSlaved: false,
    isMoving: false,
  },
  cameras: {
    telescopeCameraUrl: "",
    cctvCameraUrl: "",
    lastExposure: { duration: 0, filter: "", timestamp: "" },
  },
  system: {
    connectionStatus: "disconnected",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    apiLatency: 0,
    systemTemp: 0,
    uptime: "0h 0m 0s",
  },
};

const DEFAULT_SETTINGS: ObservatorySettings = {
  latitude: -33.8559799094,
  longitude: 151.20666584,
  elevation: 55,
  siteName: "UNSW Observatory",
  domeRadius: 2.5, // in meters
  domeCenterX: 0,
  domeCenterZ: 0,
  domeCenterY: 0, // Not used currently
  // Mount Configuration Defaults from MountVisualizer3D
  pierHeight: 1.2,
  pierDiameter: 0.82,
  pierElevatorHeight: 0.24,
  pierElevatorTopDiameter: 0.22,
  pierElevatorBottomDiameter: 0.33,
  mountBaseDiskThickness: 0.08,
  mountBaseDiskDiameter: 0.22,
  mountBaseHolderHeight: 0.23,
  mountBaseHolderThickness: 0.04,
  mountBasePolarAxisHeight: 0.17,
  mountBasePolarAxisBoltDiameter: 0.03,
  mountBasePolarAxisBoltThickness: 0.03,
  polarAxisLengthHolderSide: 0.18,
  polarAxisDiameterHolderSide: 0.12,
  polarAxisPositionHolderSide: 0.05,
  polarAxisLengthMotorSideFull: 0.17,
  polarAxisLengthMotorSideThick: 0.08,
  polarAxisDiameterMotorSide: 0.18,
  decAxisLengthMain: 0.28,
  decAxisDiameterMain: 0.11,
  decAxisPositionMain: 0.1,
  decAxisLengthMotor: 0.08,
  decAxisDiameterMotor: 0.18,
  cwShaftDiameter: 0.04,
  cwShaftLength: 0.4,
  cwEndCapDiameter: 0.05,
  cwEndCapThickness: 0.015,
  tubeLength: 0.74,
  tubeDiameter: 0.35,
  tubePivotPos: 0.24,
  tubeSensorAreaLength: 0.17,
  tubeSensorAreaDiameter: 0.1,
  tubeSecondaryTubeLength: 0.48,
  tubeSecondaryTubeDiameter: 0.1,
  tubeSecondaryTubeOffsetRadial: 0.08,
  tubeSecondaryTubeOffsetAxial: 0,
  // API and Camera
  apiBaseUrl: "/api", // Use relative path to leverage Vite's proxy
  pollingInterval: 2000,
  visualizerEnabled: true,
  useWebSocket: false,
  telescopeCameraUrl:
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80",
  cctvCameraUrl:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  cameraRefreshRate: 5,
};

export default function App() {
  const [data, setData] = useState<ObservatoryState>(initialData);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ObservatorySettings>(() => {
    try {
      const saved = localStorage.getItem("observatorySettings");
      const savedSettings = saved ? JSON.parse(saved) : {};
      return { ...DEFAULT_SETTINGS, ...savedSettings };
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      return DEFAULT_SETTINGS;
    }
  });

  // Detect GPU tier on initial load to set a sensible default for the visualizer.
  // Also, default to dark mode.
  useEffect(() => {
    (async () => {
      document.documentElement.classList.add("dark");

      // Only run GPU detection if the user hasn't already saved a preference for the visualizer
      if (settings.visualizerEnabled === null) {
        try {
          const { tier } = await getGPUTier();
          // Tier 0 and 1 are considered low-end, so disable the visualizer by default.
          const enableVisualizer = tier > 1;
          handleSettingsSave({ ...settings, visualizerEnabled: enableVisualizer });
        } catch (e) {
          console.error("GPU detection failed, enabling visualizer by default.", e);
          handleSettingsSave({ ...settings, visualizerEnabled: true });
        }
      }
    })();
  }, []);

  useEffect(() => {
    api.setApiBaseUrl(settings.apiBaseUrl);
  }, [settings.apiBaseUrl]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleSettingsSave = (newSettings: ObservatorySettings) => {
    setSettings(newSettings);
    localStorage.setItem("observatorySettings", JSON.stringify(newSettings));
    setSettingsOpen(false);
  };

  const handleSetTarget = async (coords: {
    ra?: number;
    dec?: number;
    alt?: number;
    az?: number;
    direction?: 'N' | 'S' | 'E' | 'W';
    duration_ms?: number;
    slewType?: 'equatorial' | 'altaz';
    halt?: 'all' | 'N' | 'S' | 'E' | 'W';
  }) => {
    if (coords.slewType) {
      console.log("Slewing telescope to:", coords);
      try {
        await api.slewTelescope(coords, { slewType: coords.slewType });
      } catch (error) {
        console.error("Failed to slew telescope:", error);
      }
    } else if (coords.direction && coords.duration_ms) {
      console.log(`Nudging telescope ${coords.direction} for ${coords.duration_ms}ms`);
      try {
        await api.nudgeTelescope(coords.direction, coords.duration_ms);
      } catch (error) {
        console.error("Failed to nudge telescope:", error);
      }
    } else if (coords.direction) {
      console.log(`Moving telescope ${coords.direction}`);
      await api.moveTelescope(coords.direction);
    } else if (coords.halt) {
      const direction = coords.halt === 'all' ? undefined : coords.halt;
      console.log(`Halting telescope movement for direction: ${direction || 'all'}`);
      await api.haltTelescope(direction);
    } else {
    }
  };

  const handleStopTelescope = async () => {
    console.log("EMERGENCY STOP: Stopping all telescope movement");
    try {
      await api.stopTelescope();
    } catch (error) {
      console.error("Failed to stop telescope:", error);
    }
  };

  const handleToggleTracking = async () => {
    const newTrackingState = !data.telescope.isTracking;
    console.log(`Setting tracking to: ${newTrackingState}`);
    try {
      await api.setTelescopeTracking(newTrackingState);
      setData((prev) => ({
        ...prev,
        telescope: { ...prev.telescope, isTracking: newTrackingState },
      }));
    } catch (error) {
      console.error("Failed to toggle tracking:", error);
    }
  };

  const handleFlipPierSide = async () => {
    console.log("Flipping pier side");
    try {
      await api.flipPierSide();
    } catch (error) {
      console.error("Failed to flip pier:", error);
    }
  };

  const handleToggleDomeSlaving = async () => {
    const newSlavedState = !data.dome.isSlaved;
    console.log(`Setting dome slaving to: ${newSlavedState}`);
    try {
      await api.setDomeSlave(newSlavedState);
      setData((prev) => ({
        ...prev,
        dome: { ...prev.dome, isSlaved: newSlavedState },
      }));
    } catch (error) {
      console.error("Failed to toggle dome slaving:", error);
    }
  };

  const handleSlewDome = async (azimuth: number) => {
    // Normalize azimuth to be within the 0-360 range required by the API.
    // e.g., -30 becomes 330.
    const normalizedAz = (azimuth % 360 + 360) % 360;

    console.log(`Slewing dome to: ${normalizedAz} (original: ${azimuth})`);
    try {
      await api.slewDome(normalizedAz);
    } catch (error) {
      console.error("Failed to slew dome:", error);
    }
  };


  const fetchAllData = useCallback(async () => {
    const now = Date.now();
    const shouldFetchWeather = now - lastWeatherUpdate > 60000;

    try {
      const start = performance.now();
      const { telescope, dome, motors, system, weather, time } =
        await api.getObservatoryState(settings.latitude, settings.longitude, {
          fetchWeather: shouldFetchWeather,
        });
      const end = performance.now();
      const apiLatency = end - start;

      setData((prev) => ({
        ...prev,
        telescope: telescope
          ? { ...prev.telescope, ...telescope }
          : prev.telescope,
        dome: dome
          ? {
              ...dome,
            }
          : prev.dome,
        motors: motors
          ? {
              ...motors,
              history: [
                ...prev.motors.history,
                {
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                  ...motors,
                },
              ].slice(-100),
            }
          : { ...prev.motors },
        system: system
          ? {
              ...prev.system,
              ...system,
              connectionStatus: "connected",
              apiLatency,
            }
          : { ...prev.system, connectionStatus: "error" },
        weather:
          weather && weather.current
            ? {
                ...prev.weather,
                temperature: weather.current.temperature_2m,
                humidity: weather.current.relative_humidity_2m,
                cloudCover: weather.current.cloud_cover,
                windSpeed: weather.current.wind_speed_10m,
                windDirection: weather.current.wind_direction_10m,
                pressure: weather.current.surface_pressure,
              }
            : prev.weather,
        time: time
          ? {
              localTime: new Date(`${time.local_date}T${time.local_time}`),
              utcTime: new Date(`${time.utc_date}T${time.utc_time}Z`),
              siderealTime: time.sidereal_time,
              julianDate: parseFloat(time.julian_date),
            }
          : prev.time,
      }));
      setLastUpdate(new Date());
      if (shouldFetchWeather) {
        setLastWeatherUpdate(now);
      }
    } catch (error) {
      console.error("Failed to fetch observatory state:", error);
      setData((prev) => ({
        ...prev,
        system: { ...prev.system, connectionStatus: "disconnected" },
      }));
    }
  }, [settings.latitude, settings.longitude, lastWeatherUpdate]);

  useEffect(() => {
    fetchAllData(); // Fetch initial data
    const interval = setInterval(fetchAllData, settings.pollingInterval);
    return () => clearInterval(interval);
  }, [fetchAllData, settings.pollingInterval]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass-strong sticky top-0 z-10 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-primary rounded-lg flex-shrink-0">
                <Telescope className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="truncate font-semibold">Observatory Control</h1>
                <p className="opacity-70 hidden sm:block text-sm">
                  Real-time monitoring & control
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="opacity-70 hidden md:block text-sm">
                Updated:{" "}
                {lastUpdate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="glass h-9 w-9"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="glass"
              >
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          <SystemStatus {...data.system} />
          <TimeDisplay {...data.time} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <ObservatoryLocation
              latitude={settings.latitude}
              longitude={settings.longitude}
              elevation={settings.elevation}
              siteName={settings.siteName}
            />
            <WeatherConditions {...data.weather} />
          </div>

          <TelescopePointingControl
            currentRA={data.telescope.ra}
            currentDec={data.telescope.dec}
            currentAlt={data.telescope.alt}
            currentAz={data.telescope.az}
            isTracking={data.telescope.isTracking}
            mountReady={data.telescope.mountReady}
            pierSide={data.telescope.pierSide}
            status={data.telescope.status}
            onSetTarget={handleSetTarget}
            onToggleTracking={handleToggleTracking}
            onStopTelescope={handleStopTelescope}
            onFlipPierSide={handleFlipPierSide}
          />

          {settings.visualizerEnabled === null ? ( // Show loader while detecting
            <div className="h-[450px] sm:h-[550px] flex items-center justify-center bg-muted/40 rounded-lg">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="ml-4 text-muted-foreground">Detecting GPU performance...</p>
            </div>
          ) : settings.visualizerEnabled ? ( // Show visualizer if enabled
            <MountVisualizer3D
              {...data.telescope}
              domeAzimuth={data.dome.azimuth}
              siderealTime={data.time.siderealTime}
              shutterState={data.dome.shutterState}
              {...settings}
            />
          ) : ( // Show info message if disabled
            <div className="h-[200px] flex flex-col items-center justify-center bg-muted/40 rounded-lg p-4 text-center">
              <Info className="w-8 h-8 text-muted-foreground mb-4" />
              <h4 className="font-semibold">3D Visualizer Disabled</h4>
              <p className="text-muted-foreground mt-1">
                To improve performance, the 3D model is not being rendered.
              </p>
              <Button variant="link" onClick={() => setSettingsOpen(true)} className="mt-2">
                You can re-enable it in Settings.
              </Button>
            </div>
          )}

          <DomeControl {...data.dome} onToggleSlaving={handleToggleDomeSlaving} onSlew={handleSlewDome} />
          <Temperatures {...data.motors} />
          <CameraFeeds {...data.cameras} />
        </div>
      </main>

      <footer className="border-t border-border glass-strong mt-8 sm:mt-12 py-4 sm:py-6 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 text-center opacity-70">
          <p className="text-sm sm:text-base">
            Observatory Control System v1.0
          </p>
        </div>
      </footer>

      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsSave}
      />
    </div>
  );
}