import type { GeocodingResult, WeatherResult } from "../types/weather";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class WeatherApiError extends Error {}

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
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
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
    },
  };
}

export async function getWeatherForCity(
  city: string,
  signal?: AbortSignal,
): Promise<WeatherResult> {
  const location = await geocodeCity(city, signal);
  return fetchCurrentWeather(location, signal);
}
