import type { GeocodingResult, WeatherResult } from "../types/weather";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

// Pollen coverage is Europe-only (CAMS European air quality model); every
// field comes back null elsewhere, which fetchPollen turns into a single
// `null` result so the UI can hide the row.
const POLLEN_TYPES = [
  "alder_pollen",
  "birch_pollen",
  "grass_pollen",
  "mugwort_pollen",
  "olive_pollen",
  "ragweed_pollen",
] as const;

export class WeatherApiError extends Error {}

// Open-Meteo's own current-conditions data only refreshes every 15 minutes
// (see the `interval` field in its response), so caching for that long never
// serves data staler than the API itself would return anyway.
const CACHE_TTL_MS = 15 * 60 * 1000;

interface CacheEntry {
  result: WeatherResult;
  timestamp: number;
}

const weatherCache = new Map<string, CacheEntry>();

async function geocodeCity(
  city: string,
  signal?: AbortSignal,
): Promise<GeocodingResult> {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new WeatherApiError("Failed to look up that city.");
  }

  const data = await response.json();
  const result = data.results?.[0];
  if (!result) {
    throw new WeatherApiError(`Could not find "${city}".`);
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country,
    countryCode: result.country_code,
    admin1: result.admin1,
  };
}

async function fetchCurrentWeather(
  location: GeocodingResult,
  signal?: AbortSignal,
): Promise<WeatherResult> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day,uv_index",
  );
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new WeatherApiError("Failed to fetch weather data.");
  }

  const data = await response.json();
  const current = data.current;

  return {
    location,
    current: {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      time: current.time,
      uvIndex: current.uv_index,
      pollen: null,
    },
  };
}

async function fetchPollen(
  location: GeocodingResult,
  signal?: AbortSignal,
): Promise<number | null> {
  try {
    const url = new URL(AIR_QUALITY_URL);
    url.searchParams.set("latitude", String(location.latitude));
    url.searchParams.set("longitude", String(location.longitude));
    url.searchParams.set("current", POLLEN_TYPES.join(","));
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url, { signal });
    if (!response.ok) return null;

    const data = await response.json();
    const values = POLLEN_TYPES.map((key) => data.current?.[key]).filter(
      (value: unknown): value is number => typeof value === "number",
    );

    return values.length > 0 ? Math.max(...values) : null;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return null;
  }
}

export async function getWeatherForCity(
  city: string,
  signal?: AbortSignal,
): Promise<WeatherResult> {
  const cacheKey = city.trim().toLowerCase();
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const location = await geocodeCity(city, signal);
  const [weather, pollen] = await Promise.all([
    fetchCurrentWeather(location, signal),
    fetchPollen(location, signal),
  ]);

  const result: WeatherResult = {
    ...weather,
    current: { ...weather.current, pollen },
  };

  weatherCache.set(cacheKey, { result, timestamp: Date.now() });
  return result;
}
