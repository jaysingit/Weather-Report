import { useEffect, useState } from "react";
import { getWeatherForCity, WeatherApiError } from "../api/weather";
import type {
  TemperatureUnit,
  WeatherResult,
  WindUnit,
} from "../types/weather";
import { getWeatherCodeInfo } from "../utils/weatherCodes";
import { formatLocalTime } from "../utils/formatTime";
import { getPollenLevel } from "../utils/pollenLevel";
import { celsiusToFahrenheit, kmhToMph } from "../utils/units";

interface WeatherDisplayProps {
  city: string;
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
}

function WeatherDisplay({
  city,
  temperatureUnit,
  windUnit,
}: WeatherDisplayProps) {
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getWeatherForCity(city, controller.signal)
      .then(setWeather)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof WeatherApiError
            ? err.message
            : "Something went wrong. Please try again.",
        );
        setWeather(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [city]);

  if (loading) {
    return (
      <section className="weather-card">
        <p>Loading weather for {city}...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="weather-card">
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!weather) {
    return null;
  }

  const { location, current } = weather;
  const { description, icon } = getWeatherCodeInfo(
    current.weatherCode,
    current.isDay,
  );

  const isFahrenheit = temperatureUnit === "fahrenheit";
  const isMph = windUnit === "mph";

  const temperature = isFahrenheit
    ? celsiusToFahrenheit(current.temperature)
    : current.temperature;
  const apparentTemperature = isFahrenheit
    ? celsiusToFahrenheit(current.apparentTemperature)
    : current.apparentTemperature;
  const windSpeed = isMph ? kmhToMph(current.windSpeed) : current.windSpeed;
  const temperatureUnitLabel = isFahrenheit ? "°F" : "°C";
  const windUnitLabel = isMph ? "mph" : "km/h";

  return (
    <section
      className={`weather-card${current.isDay ? "" : " weather-card--night"}`}
    >
      <div className="location-header">
        <img
          className="country-flag"
          src={`https://flagcdn.com/w160/${location.countryCode.toLowerCase()}.png`}
          alt={`${location.country} flag`}
        />
        <h2>
          {location.name}
          {location.admin1 ? `, ${location.admin1}` : ""}, {location.country}
        </h2>
        <p className="local-time">{formatLocalTime(current.time)}</p>
      </div>
      <p className="weather-icon">{icon}</p>
      <p className="temperature">
        {Math.round(temperature)}
        {temperatureUnitLabel}
      </p>
      <p className="description">{description}</p>
      <dl className="weather-details">
        <div>
          <dt>Feels like</dt>
          <dd>
            {Math.round(apparentTemperature)}
            {temperatureUnitLabel}
          </dd>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{current.humidity}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>
            {Math.round(windSpeed)} {windUnitLabel}
          </dd>
        </div>
        <div>
          <dt>UV Index</dt>
          <dd>{Math.round(current.uvIndex)}</dd>
        </div>
        {current.pollen !== null && (
          <div>
            <dt>Pollen</dt>
            <dd>{getPollenLevel(current.pollen)}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export default WeatherDisplay;
