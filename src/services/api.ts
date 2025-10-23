import { ObservatorySettings } from '../components/SettingsPanel';

// Use a relative path for the API base URL. This allows Vite's proxy to
// intercept the requests during development. For a production build, you would
// configure your web server (e.g., Nginx) to proxy /api to the backend.
// The default in App.tsx is "http://localhost:8000/api", which will be overridden.
let API_BASE_URL = "/api";

export function setApiBaseUrl(baseUrl: string) {
  API_BASE_URL = baseUrl;
}

async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }
  return response.json();
}

/**
 * Parses RA/Dec strings like "12h 34m 56s" or "12.345" into decimal degrees/hours.
 * A more robust implementation might be needed depending on mount output.
 */
// function parseCoordinate(coordStr: string): number {
//     if (coordStr.includes('h') || coordStr.includes('m') || coordStr.includes('s')) {
//         const parts = coordStr.replace(/[hms]/g, ' ').split(' ').filter(Boolean);
//         return parts.reduce((acc, part, i) => acc + parseFloat(part) / (60 ** i), 0);
//     }
//     if (coordStr.includes('°') || coordStr.includes("'") || coordStr.includes('"')) {
//         const parts = coordStr.replace(/[°'"]/g, ' ').split(' ').filter(Boolean);
//         const sign = coordStr.startsWith('-') ? -1 : 1;
//         return sign * parts.reduce((acc, part, i) => acc + parseFloat(part) / (60 ** i), 0);
//     }
//     return parseFloat(coordStr);
// }

/**
 * Parses RA/Dec/Alt/Az strings from various formats into decimal degrees/hours.
 * Handles formats like: "219d54m07.5s", "-60d50m02s", "58:13:59.15", "12h30m00s"
 */
function parseCoordinate(coordStr: string | undefined | null): number {
    if (!coordStr) return 0;

    const sign = coordStr.startsWith('-') ? -1 : 1;
    const cleanedStr = coordStr.replace(/^-/, '');

    let parts: string[];
    if (cleanedStr.includes('d') || cleanedStr.includes('°')) { // Degrees, Minutes, Seconds (dms or °'")
        parts = cleanedStr.split(/[d°'"]/g).filter(Boolean);
    } else if (cleanedStr.includes('h')) { // Hours, Minutes, Seconds (hms)
         parts = cleanedStr.split(/[hms]/g).filter(Boolean);
         // Convert hours to degrees for consistency, though we convert back in the visualizer for display
         return parts.reduce((acc, part, i) => acc + parseFloat(part) / (60 ** i), 0);
    } else if (cleanedStr.includes(':')) { // Colon-separated (Alt/Az)
        parts = cleanedStr.split(':');
    } else {
        // Assume it's already a decimal number
        return parseFloat(coordStr);
    }

    const decimal = parts.reduce((acc, part, i) => acc + parseFloat(part) / (60 ** i), 0);
    return decimal * sign;
}




// --- Telescope Control ---

export const getTelescopeStatus = () => fetchApi("/telescope/mount_status");

export const slewTelescope = async (coords: {
    ra?: number;
    dec?: number;
    alt?: number;
    az?: number;
}, slewOptions: {
    slewType: 'equatorial' | 'altaz';
    pierSide?: 'East' | 'West';
}) => {
  // Step 1: Set the target coordinates
  await fetchApi("/telescope/target", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(coords),
  });
  
  // Step 2: Issue the slew command
  return fetchApi("/telescope/slew", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // The backend now requires the slew_type to be specified
    body: JSON.stringify({ 
      slew_type: slewOptions.slewType,
      pier_side: slewOptions.pierSide,
    }),
  });
};

export const setTelescopeTracking = (tracking: boolean) =>
  fetchApi(`/telescope/tracking/${tracking ? 'start' : 'stop'}`, {
    method: "POST",
  });

export const flipPierSide = () =>
  fetchApi("/telescope/flip", {
    method: "POST",
  });

export const parkTelescope = () => fetchApi("/telescope/park", { method: "POST" });
export const unparkTelescope = () => fetchApi("/telescope/unpark", { method: "POST" });

export const nudgeTelescope = (direction: 'N' | 'S' | 'E' | 'W', duration_ms: number) =>
  fetchApi(`/telescope/nudge?direction=${direction}&duration_ms=${duration_ms}`, {
    method: "POST",
  });

export const moveTelescope = (direction: 'N' | 'S' | 'E' | 'W') =>
  fetchApi(`/telescope/move?direction=${direction}`, {
    method: "POST",
  });

export const haltTelescope = (direction?: 'N' | 'S' | 'E' | 'W') =>
  fetchApi("/telescope/halt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // The backend expects an empty string to halt all movement
    body: JSON.stringify({ direction: direction || "" }),
  });

export const stopTelescope = () =>
  fetchApi("/telescope/stop", {
    method: "POST",
  });



// --- Dome & Shutter Control ---

export const getDomeStatus = () => fetchApi("/dome/status");

export const getDomeSyncStatus = () => fetchApi("/dome/sync/status");

export const setDomeSlave = (slave: boolean) =>
  fetchApi("/dome/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slave }),
  });

export const slewDome = (azimuth: number) =>
  fetchApi("/dome/slew", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ az: azimuth }),
  });

export const openShutter = () =>
  fetchApi("/shutter/open", {
    method: "POST",
  });

export const closeShutter = () =>
  fetchApi("/shutter/close", {
    method: "POST",
  });

export const stopDome = () =>
  fetchApi("/dome/stop", {
    method: "POST",
  });





// --- Other Observatory Data ---

export const getTemperatures = () => fetchApi("/telescope/temperatures");

export const getSystemStatus = () => fetchApi("/system/status");

export const getTime = () => fetchApi("/telescope/time");

/**
 * Fetches weather from a public API instead of the backend.
 * Uses Open-Meteo API.
 * @param lat Latitude
 * @param lon Longitude
 */
export const getWeatherFromApi = (lat: number, lon: number) => {
    // Response Schema:
    // {
    //   "latitude": -33.75,
    //   "longitude": 151.125,
    //   "generationtime_ms": 0.134468078613281,
    //   "utc_offset_seconds": 39600,
    //   "timezone": "Australia/Sydney",
    //   "timezone_abbreviation": "GMT+11",
    //   "elevation": 51,
    //   "current_units": {
    //     "time": "iso8601",
    //     "interval": "seconds",
    //     "temperature_2m": "°C",
    //     "relative_humidity_2m": "%",
    //     "apparent_temperature": "°C",
    //     "is_day": "",
    //     "precipitation": "mm",
    //     "rain": "mm",
    //     "weather_code": "wmo code",
    //     "cloud_cover": "%",
    //     "surface_pressure": "hPa",
    //     "showers": "mm",
    //     "wind_speed_10m": "km/h",
    //     "wind_direction_10m": "°"
    //   },
    //   "current": {
    //     "time": "2025-10-14T00:45",
    //     "interval": 900,
    //     "temperature_2m": 15.2,
    //     "relative_humidity_2m": 69,
    //     "apparent_temperature": 14.8,
    //     "is_day": 0,
    //     "precipitation": 0,
    //     "rain": 0,
    //     "weather_code": 3,
    //     "cloud_cover": 82,
    //     "surface_pressure": 1015.1,
    //     "showers": 0,
    //     "wind_speed_10m": 2.3,
    //     "wind_direction_10m": 51
    //   }
    // }
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,surface_pressure,showers,wind_speed_10m,wind_direction_10m&timezone=Australia%2FSydney`
    return fetch(apiUrl).then(res => res.json());
}

/**
 * Fetches all observatory data in one go.
 * This is an efficient way to update the UI state.
 * You will need to create a backend endpoint that aggregates this data.
 */
export const getObservatoryState = async (
    lat: number,
    lon: number,
    options: { fetchWeather: boolean } = { fetchWeather: true }) => {
    // Fetch all backend data concurrently using Promise.allSettled
    // This prevents one failed request from failing the entire batch.
    const results = await Promise.allSettled([
        getTelescopeStatus(),
        getDomeStatus(),
        getDomeSyncStatus(),
        getTemperatures(),
        getSystemStatus(),
        getTime(),
    ]);
    
    const [mountStatusRes, domeStatusRes, domeSyncRes, motorsRes, systemRes, timeRes] = results;

    // Helper to extract value or return null if promise was rejected
    const getValue = <T>(result: PromiseSettledResult<T>, endpointName: string): T | null => {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        console.error(`Failed to fetch ${endpointName}:`, result.reason);
        return null;
    };

    const mountStatus = getValue(mountStatusRes, 'mount_status');
    const domeStatus = getValue(domeStatusRes, 'dome_status');
    const domeSync = getValue(domeSyncRes, 'dome_sync_status');
    const motors = getValue(motorsRes, 'temperatures');
    const system = getValue(systemRes, 'system_status');
    const time = getValue(timeRes, 'time');

    const weather = options.fetchWeather
        ? await getWeatherFromApi(lat, lon).catch(err => { console.error("Failed to fetch weather:", err); return null; })
        : null;

    // Process and structure the data for the frontend
    const telescope = {
        ra: parseCoordinate(mountStatus?.ra_str),
        dec: parseCoordinate(mountStatus?.dec_str),
        alt: parseCoordinate(mountStatus?.alt_str),
        az: parseCoordinate(mountStatus?.az_str),
        isTracking: mountStatus?.is_tracking ?? false,
        mountReady: mountStatus?.status?.toLowerCase().includes("tracking") || mountStatus?.status?.toLowerCase().includes("stopped"),
        status: mountStatus?.status ?? "Unknown",
        // Capitalize 'east' or 'west'
        pierSide: mountStatus?.pier_side 
            ? mountStatus.pier_side.charAt(0).toUpperCase() + mountStatus.pier_side.slice(1) 
            : 'Unknown',
    };

    const processedMotors = {
        motorRaAz: motors?.motor_ra_az ?? null,
        motorDecAlt: motors?.motor_dec_alt ?? null,
        motorRaAzDriver: motors?.motor_ra_az_driver ?? null,
        motorDecAltDriver: motors?.motor_dec_alt_driver ?? null,
        electronicsBox: motors?.electronics_box ?? null,
        keypadDisplay: motors?.keypad_display ?? null,
        keypadPcb: motors?.keypad_pcb ?? null,
        keypadController: motors?.keypad_controller ?? null,
    };

    const processedSystem = system ? {
        cpuUsage: system.cpu_usage,
        memoryUsage: system.memory_usage,
        diskUsage: system.disks?.find((d: { mountpoint: string; }) => d.mountpoint === '/')?.percent ?? system.disks?.[0]?.percent ?? 0,
        systemTemp: system.cpu_temperature?.[Object.keys(system.cpu_temperature)[0]]?.[0]?.current ?? 0,
        uptime: system.uptime,
    } : null;

    const safeSystem = processedSystem || { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, systemTemp: 0, uptime: "0" };

    const processedDome = domeStatus ? {
        azimuth: domeStatus.az ?? 0,
        isMoving: domeStatus.moving ?? false,
        isSlaved: domeSync?.dome_sync ?? false,
        shutterState: "unknown", // This is hardcoded for now as shutter status is separate
    } : null;

    return { telescope, dome: processedDome, motors: processedMotors, system: safeSystem, weather, time };
};
