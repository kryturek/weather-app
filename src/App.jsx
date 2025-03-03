import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import getDynamicFontSize from "./getDynamicFontSize";
import convertTimestamptoTime from "./convertTimestampToTime";

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function App() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [location, setLocation] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isDark, setIsDark] = useState(true);

  const inputRef = useRef();

  // Focus on the input field on mount.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Match user’s system preference for dark mode on initial load
  useEffect(() => {
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  // Fetch suggestions (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input && input.length > 2) {
        fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            input
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.results) {
              setSuggestions(data.results);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  function handleSuggestionClick(suggestion) {
    setInput(suggestion.name);
    setLocation(suggestion.name);
    setStateName(suggestion.admin1 || "");
    setCountry(suggestion.country || "");
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeatherData(suggestion.latitude, suggestion.longitude, suggestion.name);
  }

  function processLocation(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWeather({});
    setLocation("");
    setStateName("");
    setCountry("");

    if (suggestions && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    } else {
      setError("Location was not found!");
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      setLoading(true);
      if (suggestions && suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else {
        setError("Location was not found!");
        setLoading(false);
      }
    }
  }

  function fetchWeatherData(lat, lon, locationName) {
    const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const baseurlweather = "https://api.openweathermap.org/data/2.5/weather?";

    fetch(`${baseurlweather}lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cod === "404") {
          setError(`${locationName} not found!`);
          setWeather({});
        } else {
          setWeather(data);
          setLocation(locationName);
        }
        setLoading(false);
        setInput("");
      })
      .catch((error) => {
        setError("An error occurred while fetching weather data");
        setLoading(false);
      });
  }

  return (
    <div className={`App ${isDark ? "dark" : "light"}`}>
      <header>
        <h1>Weather App</h1>
        <div className="top-controls">
          <form onSubmit={processLocation}>
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter location!"
                value={input}
                onChange={(ev) => setInput(ev.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => {
                  // Delay hiding suggestions so clicks can register
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion) => (
                    <li
                      key={`${suggestion.latitude}-${suggestion.longitude}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.name}
                      {suggestion.admin1 ? `, ${suggestion.admin1}` : ""},{" "}
                      {suggestion.country}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className="uselessButton" type="submit">
              Search
            </button>
          </form>

          {/* Moved the theme-toggle button out of the normal flow */}
          <button
            className="theme-toggle"
            onClick={() => setIsDark((prev) => !prev)}
          >
            {isDark ? "Light Theme" : "Dark Theme"}
          </button>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="weather weatherLoading">
            <div className="lds-dual-ring"></div>
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : weather.main ? (
          <div className="weather">
            <div className="overview">
              <div className="overviewLocation">
                <p
                  className="locationInfo li-name"
                  style={{ fontSize: getDynamicFontSize(location) }}
                >
                  {location}
                </p>
                <div className="stateAndCountry">
                  <p className="locationInfo">
                    {stateName}, {country}
                  </p>
                </div>
              </div>
              <img
                className="weatherIcon"
                src={`/icons/${weather.weather[0].icon}.png`}
                alt=""
              />
              <p className="temperatureInfo">
                {Math.round(weather.main.temp)}°C
              </p>
            </div>
            <div className="info">
              <div className="geo">
                <p>
                  {`${Math.abs(
                    Math.round(weather.coord.lat * 100) / 100
                  )}`}
                  {weather.coord.lat >= 0 ? "°N" : "°S"}
                </p>
                <p>
                  {`${Math.abs(
                    Math.round(weather.coord.lon * 100) / 100
                  )}`}
                  {weather.coord.lon >= 0 ? "°E" : "°W"}
                </p>
              </div>
              <p>Feels like {Math.round(weather.main.feels_like)}°C</p>
              <p>
                {weather.weather[0].main} ({weather.weather[0].description})
              </p>
              <p>
                Current time:{" "}
                {convertTimestamptoTime(weather.dt, weather.timezone)}
              </p>
              <p>
                Sunset:{" "}
                {convertTimestamptoTime(weather.sys.sunset, weather.timezone)}
              </p>
              <p>
                Sunrise:{" "}
                {convertTimestamptoTime(weather.sys.sunrise, weather.timezone)}
              </p>
            </div>
            {/* Leaflet map with updated center & no zoom controls */}
            <MapContainer
              center={[weather.coord.lat, weather.coord.lon]}
              zoom={10}
              style={{ height: "400px", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                url={
                  isDark
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution={
                  isDark
                    ? "&copy; <a href='https://carto.com/attributions'>CARTO</a>"
                    : "&copy; OpenStreetMap contributors"
                }
              />
              <Marker position={[weather.coord.lat, weather.coord.lon]}>
                <Popup>{location}</Popup>
              </Marker>
              <ChangeMapView center={[weather.coord.lat, weather.coord.lon]} />
            </MapContainer>
          </div>
        ) : (
          <div className="nothingEntered">
            <div className="arrow"></div>
            <div>
              <p>
                Start typing a city or locality in the search box and choose it
                from the dropdown menu. That's it!
              </p>
              <p>
                You'll see the current weather and a map of your chosen
                location.
              </p>
            </div>
          </div>
        )}
      </main>
      <footer>
        <div className="tag">
          <p>Krys Turek</p>
        </div>
        <div className="links">
          <ul>
            <li>
              <a
                href="https://github.com/kryturek"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/github-icon.png" alt="my github page" />
              </a>
            </li>
            <li>
              <a
                href="https://portfolio-omega-flax.vercel.app/"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/portfolio-icon.png" alt="my portfolio page" />
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;