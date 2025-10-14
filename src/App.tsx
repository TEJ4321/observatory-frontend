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
import { Telescope, Settings, Moon, Sun } from "lucide-react";
import * as api from "./services/api";
import { Button } from "./components/ui/button";

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
  domeCenterY: 0,
  domeCenterZ: 0,
  pierHeight: 1.5, // in meters
  pierRadius: 0.41, // in meters
  mountHeight: 0.2, // in meters, height of the actual RA axis mount point
  mountOffsetX: 0.14*Math.sin(20*Math.PI/180), // in meters, +ve east
  mountOffsetZ: 0.14*Math.cos(20*Math.PI/180), // in meters, +ve south
  raAxisLength: 0.1, // in meters
  raAxisRadius: 0.05, // in meters
  decAxisLength: 0.42, // in meters
  decAxisRadius: 0.05, // in meters
  tubeLength: 1.5, // in meters
  tubeRadius: 0.2, // in meters
  tubePosition: 0.4, // decimal between 0 and 1 indicating how far forward the pivot point is
  counterweightShaftLength: 0.6, // in meters
  counterweightShaftRadius: 0.02, // in meters
  counterweightAmount: 3,
  counterweightGap: 0.04, // in meters
  counterweightRadius: 0.06, // in meters
  counterweightFirstPos: 0.4, // in meters
  counterweightThickness: 0.05, // in meters
  apiBaseUrl: "/api", // Use relative path to leverage Vite's proxy
  pollingInterval: 10000,
  useWebSocket: false,
  telescopeCameraUrl:
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80",
  cctvCameraUrl:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  cameraRefreshRate: 5,
};

// CODE START -----------------------------------------------------------------------------------
export default function App() {
  const [data, setData] = useState<ObservatoryState>(initialData);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ObservatorySettings>(() => {
    const saved = localStorage.getItem("observatorySettings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

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

  const handleSetTarget = async (coords: {
    ra?: number;
    dec?: number;
    alt?: number;
    az?: number;
  }) => {
    console.log("Slewing telescope to:", coords);
    try {
      await api.slewTelescope(coords);
    } catch (error) {
      console.error("Failed to slew telescope:", error);
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
              ...prev.dome,
              ...dome,
              shutterState: dome.shutter_status ?? prev.dome.shutterState,
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
            onSetTarget={handleSetTarget}
            onToggleTracking={handleToggleTracking}
            onFlipPierSide={handleFlipPierSide}
          />

          <MountVisualizer3D
            {...data.telescope}
            domeAzimuth={data.dome.azimuth}
            siderealTime={data.time.siderealTime}
            shutterState={data.dome.shutterState}
            domeRadius={settings.domeRadius} // in meters
            latitude={settings.latitude}
            pierHeight={settings.pierHeight} // in meters
            pierRadius={settings.pierRadius} // in meters
            mountHeight={settings.mountHeight} // in meters} height of the actual RA axis mount point
            mountOffsetX={settings.mountOffsetX} // in meters} +ve east
            mountOffsetZ={settings.mountOffsetZ} // in meters} +ve south
            raAxisLength={settings.raAxisLength} // in meters
            raAxisRadius={settings.raAxisRadius} // in meters
            decAxisLength={settings.decAxisLength} // in meters
            decAxisRadius={settings.decAxisRadius} // in meters
            tubeLength={settings.tubeLength} // in meters
            tubeRadius={settings.tubeRadius} // in meters
            tubePosition={settings.tubePosition} // decimal between 0 and 1 indicating how far forward the pivot point is
            counterweightShaftLength={settings.counterweightShaftLength} // in meters
            counterweightShaftRadius={settings.counterweightShaftRadius} // in meters
            counterweightAmount={settings.counterweightAmount}
            counterweightGap={settings.counterweightGap} // in meters
            counterweightRadius={settings.counterweightRadius} // in meters
            counterweightFirstPos={settings.counterweightFirstPos} // in meters
            counterweightThickness={settings.counterweightThickness} // in meters
          />

          <DomeControl {...data.dome} />
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
        onSettingsChange={setSettings}
      />
    </div>
  );
}