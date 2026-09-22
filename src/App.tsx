import { useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherDisplay from "./components/WeatherDisplay";
import "./App.css";

function App() {
  const [city, setCity] = useState("");

  return (
    <div className="page">
      <header className="page-header">
        <h1>Weatherly</h1>
        <p className="subtitle">Check the weather anywhere in the world</p>
      </header>

      <SearchBar onSearch={setCity} onReset={() => setCity("")} />

      <main className="content">
        {city ? (
          <WeatherDisplay city={city} />
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
