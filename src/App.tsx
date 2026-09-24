import { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherDisplay from "./components/WeatherDisplay";
import UnitToggle from "./components/UnitToggle";
import type { TemperatureUnit, WindUnit } from "./types/weather";
import "./App.css";

const TEMPERATURE_UNIT_STORAGE_KEY = "weatherly-temperature-unit";
const WIND_UNIT_STORAGE_KEY = "weatherly-wind-unit";

function getInitialTemperatureUnit(): TemperatureUnit {
  try {
    const stored = localStorage.getItem(TEMPERATURE_UNIT_STORAGE_KEY);
    return stored === "fahrenheit" ? "fahrenheit" : "celsius";
  } catch {
    return "celsius";
  }
}

function getInitialWindUnit(): WindUnit {
  try {
    const stored = localStorage.getItem(WIND_UNIT_STORAGE_KEY);
    return stored === "mph" ? "mph" : "kmh";
  } catch {
    return "kmh";
  }
}

function App() {
  const [city, setCity] = useState("");
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>(
    getInitialTemperatureUnit,
  );
  const [windUnit, setWindUnit] = useState<WindUnit>(getInitialWindUnit);

  useEffect(() => {
    try {
      localStorage.setItem(TEMPERATURE_UNIT_STORAGE_KEY, temperatureUnit);
    } catch {
      // ignore (e.g. private browsing storage restrictions)
    }
  }, [temperatureUnit]);

  useEffect(() => {
    try {
      localStorage.setItem(WIND_UNIT_STORAGE_KEY, windUnit);
    } catch {
      // ignore (e.g. private browsing storage restrictions)
    }
  }, [windUnit]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Weatherly</h1>
        <p className="subtitle">Check the weather anywhere in the world</p>
      </header>

      <div className="unit-toggles">
        <UnitToggle
          value={temperatureUnit}
          onChange={setTemperatureUnit}
          ariaLabel="Temperature unit"
          options={[
            { value: "celsius", label: "°C" },
            { value: "fahrenheit", label: "°F" },
          ]}
        />
        <UnitToggle
          value={windUnit}
          onChange={setWindUnit}
          ariaLabel="Wind speed unit"
          options={[
            { value: "kmh", label: "km/h" },
            { value: "mph", label: "mph" },
          ]}
        />
      </div>

      <SearchBar onSearch={setCity} onReset={() => setCity("")} />

      <main className="content">
        {city ? (
          <WeatherDisplay
            city={city}
            temperatureUnit={temperatureUnit}
            windUnit={windUnit}
          />
        ) : (
          <p className="empty-state">
            Search for a city to see the current weather.
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
