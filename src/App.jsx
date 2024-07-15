import { useEffect, useState } from "react";
import "./App.css";

function convertTimestamptoTime(unixTimestamp, timezone) {
	let dateObj = new Date((unixTimestamp + timezone) * 1000);
	let hours = dateObj.getUTCHours();
	let minutes = dateObj.getUTCMinutes();
	let seconds = dateObj.getUTCSeconds();

	let formattedTime =
		hours.toString().padStart(2, "0") +
		":" +
		minutes.toString().padStart(2, "0") +
		":" +
		seconds.toString().padStart(2, "0");

	return formattedTime;
}

function App() {
	const api = {
		key: import.meta.env.VITE_WEATHER_API_KEY,
		baseurlgeo: "https://api.openweathermap.org/geo/1.0/direct?",
		baseurlweather: "https://api.openweathermap.org/data/2.5/weather?",
	};

	const [location, setLocation] = useState("");
	const [geoData, setGeoData] = useState([]);
	const [weather, setWeather] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [input, setInput] = useState("");
	const [lastSearched, setLastSearched] = useState(
		sessionStorage.getItem("lastSearched") || ""
	);

	function processLocation(ev, loc) {
		if (ev) ev.preventDefault();
		const searchLocation = loc || input;
		setLoading(true);
		setError(null);
		setWeather({});
		setGeoData([]);

		fetch(`${api.baseurlgeo}q=${searchLocation}&limit=1&appid=${api.key}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.length === 0) {
					setError("Location was not found");
					setLoading(false);
					return;
				} else {
					setGeoData(data);
				}
			})
			.catch((error) => {
				setError("An error occurred while fetching geo data");
				setLoading(false);
			});

		fetch(
			`${api.baseurlweather}q=${searchLocation}&units=metric&appid=${api.key}`
		)
			.then((res) => res.json())
			.then((data) => {
				if (data.cod === "404") {
					setError(`${searchLocation} not found!`);
					setWeather({});
				} else {
					setWeather(data);
					if (weather.name !== searchLocation) {
						setLastSearched(location); // Set last searched to the previous successful search
						sessionStorage.setItem("lastSearched", location);
					}
					setLocation(searchLocation);
				}
				setLoading(false);
				setInput("");
			})
			.catch((error) => {
				setError("An error occurred while fetching weather data");
				setLoading(false);
			});
	}

	function handleLastSearchedClick(lastSearchedLocation) {
		setInput(lastSearchedLocation);
		processLocation(undefined, lastSearchedLocation);
	}

	return (
		<div className="App">
			<header>
				<h1>Weather App</h1>
				<form onSubmit={processLocation}>
					<input
						type="text"
						placeholder="enter location!"
						value={input}
						onChange={(ev) => setInput(ev.target.value)}
					/>
					<button type="submit">Search</button>
				</form>

				<div className="lastSearchedDiv">
					{lastSearched ? (
						<span className="lastSearched">
							Last searched:{" "}
							<a
								href="#"
								onClick={() => handleLastSearchedClick(lastSearched)}
							>
								{lastSearched}
							</a>
						</span>
					) : (
						""
					)}
				</div>
			</header>

			{loading ? (
				<div className="weather weatherLoading">
					<div className="lds-dual-ring"></div>
				</div>
			) : error ? (
				<p>{error}</p>
			) : weather.main && geoData[0] ? (
				<div className="weather">
					<div className="overview">
						<div className="overviewLocation">
							<p className="locationInfo li-name">{geoData[0].name}</p>
							<div className="stateAndCountry">
								<p className="locationInfo">
									{geoData[0].state}, {geoData[0].country}
								</p>
							</div>
						</div>
						<img
							className="weatherIcon"
							src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
							alt=""
						/>
						<p className="temperatureInfo">
							{Math.round(weather.main.temp)}°C
						</p>
					</div>
					<div className="info">
						<div className="geo">
							<p>Latitude: {Math.round(geoData[0].lat * 100) / 100}</p>
							<p>Longitude: {Math.round(geoData[0].lon * 100) / 100}</p>
						</div>
						<p>Feels like {Math.round(weather.main.feels_like)}°C</p>
						<p>
							{weather.weather[0].main} ({weather.weather[0].description}
							)
						</p>
						<p>
							Sunset:{" "}
							{convertTimestamptoTime(
								weather.sys.sunset,
								weather.timezone
							)}
						</p>
						<p>
							Sunrise:{" "}
							{convertTimestamptoTime(
								weather.sys.sunrise,
								weather.timezone
							)}
						</p>
					</div>
				</div>
			) : (
				<p></p>
			)}
		</div>
	);
}

export default App;
