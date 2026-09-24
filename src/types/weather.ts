export interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
  uvIndex: number;
  pollen: number | null;
}

export interface WeatherResult {
  location: GeocodingResult;
  current: CurrentWeather;
}

export type TemperatureUnit = "celsius" | "fahrenheit";
export type WindUnit = "kmh" | "mph";
