import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import getDynamicFontSize from "./getDynamicFontSize";
import convertTimestamptoTime from "./convertTimestampToTime";

// Component to update the map view when the center changes
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
  // API keys and endpoints
  const api = {
    key: import.meta.env.VITE_WEATHER_API_KEY,
    baseurlweather: "https://api.openweathermap.org/data/2.5/weather?",
  };

  const [location, setLocation] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDark, setIsDark] = useState(true);

  const inputRef = useRef();

  // Focus on the input field on mount.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Set dark/light mode based on system preference.
  useEffect(() => {
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  // Fetch autocomplete suggestions from Open-Meteo Geocoding API (debounced).
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
            } else {
              setSuggestions([]);
            }
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  // Called when the user selects a suggestion.
  function handleSuggestionClick(suggestion) {
    setInput(suggestion.name);
    setLocation(suggestion.name);
    setStateName(suggestion.admin1 || "");
    setCountry(suggestion.country || "");
    setSuggestions([]);
    fetchWeatherData(suggestion.latitude, suggestion.longitude, suggestion.name);
  }

  // On form submission, use the first suggestion (if any).
  function processLocation(ev) {
    ev.preventDefault();
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

  // If the user presses Enter, use the first suggestion.
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      setLoading(true);
      if (suggestions && suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else {
        setError("Location was not found!");
        setLoading(false);
      }
    }
  }

  // Fetch weather data from OpenWeatherMap.
  function fetchWeatherData(lat, lon, locationName) {
    fetch(
      `${api.baseurlweather}lat=${lat}&lon=${lon}&units=metric&appid=${api.key}`
    )
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
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter location!"
              value={input}
              onChange={(ev) => setInput(ev.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="uselessButton" type="submit">
              Search
            </button>

			        {/* Dropdown autocomplete suggestions */}
					{suggestions && suggestions.length > 0 && (
          <select
            className="suggestions-dropdown"
            onChange={(e) => {
              const selectedIndex = e.target.selectedIndex;
              if (selectedIndex >= 0) {
                handleSuggestionClick(suggestions[selectedIndex]);
              }
            }}
            size={suggestions.length > 3 ? 3 : suggestions.length} // shows up to 3 options at once
          >
            {suggestions.map((suggestion) => (
              <option
                value={suggestion.name}
                key={`${suggestion.latitude}-${suggestion.longitude}`}
              >
                {suggestion.name}
                {suggestion.admin1 ? `, ${suggestion.admin1}` : ""}, {suggestion.country}
              </option>
            ))}
          </select>
        )}
          </form>
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
                {weather.weather[0].main} (
                {weather.weather[0].description})
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
            {/* Leaflet map with updated center */}
            <MapContainer
              center={[weather.coord.lat, weather.coord.lon]}
              zoom={10}
              style={{ height: "400px", width: "100%" }}
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