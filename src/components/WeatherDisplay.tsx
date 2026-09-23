import { useEffect, useState } from "react";
import { getWeatherForCity, WeatherApiError } from "../api/weather";
import type { WeatherResult } from "../types/weather";
import { getWeatherCodeInfo } from "../utils/weatherCodes";
import { formatLocalTime } from "../utils/formatTime";
import { getPollenLevel } from "../utils/pollenLevel";

interface WeatherDisplayProps {
  city: string;
}

function WeatherDisplay({ city }: WeatherDisplayProps) {
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
      <p className="temperature">{Math.round(current.temperature)}°C</p>
      <p className="description">{description}</p>
      <dl className="weather-details">
        <div>
          <dt>Feels like</dt>
          <dd>{Math.round(current.apparentTemperature)}°C</dd>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{current.humidity}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{Math.round(current.windSpeed)} km/h</dd>
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
