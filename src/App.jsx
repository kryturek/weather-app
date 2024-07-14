import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Link } from "react-router-dom";

function convertTimestamptoTime(unixTimestamp, timezone) {
	// Convert to milliseconds and
	// then create a new Date object
	let dateObj = new Date((unixTimestamp + timezone) * 1000);

	// Get hours from the timestamp
	let hours = dateObj.getUTCHours();

	// Get minutes part from the timestamp
	let minutes = dateObj.getUTCMinutes();

	// Get seconds part from the timestamp
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
		key: "fa7fce5a165ee9ae4a181a41305fd2a6",
		baseurlgeo: "https://api.openweathermap.org/geo/1.0/direct?",
		baseurlweather: "https://api.openweathermap.org/data/2.5/weather?",
	};

	const [location, setLocation] = useState("");
	const [geoData, setGeoData] = useState({});
	const [weather, setWeather] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	function processLocation(ev) {
		ev.preventDefault();
		setLoading(true);
		setError(null);
		if (weather.name != undefined) {
			sessionStorage.setItem("lastSearched", weather.name);
		}
		// sessionStorage.removeItem("lastSearched");
		fetch(`${api.baseurlgeo}q=${location}&limit=1&appid=${api.key}`)
			.then((res) => res.json())
			.then((data) => {
				setGeoData(data);
			});

		fetch(`${api.baseurlweather}q=${location}&units=metric&appid=${api.key}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.cod == "404") {
					setError(`${location} not found!`);
				} else {
					setWeather(data);
				}
				setLoading(false);
			})
			.catch(setLoading(false));
	}

	return (
		<div className="App">
			<header>
				<h1>Weather App</h1>
				<form>
					<input
						type="text"
						placeholder="enter location!"
						value={location}
						onChange={(ev) => setLocation(ev.target.value)}
					/>
					<button onClick={processLocation}>Search</button>
				</form>

				{sessionStorage.getItem("lastSearched") ? (
					<span className="lastSearched">
						Last searched: {sessionStorage.getItem("lastSearched")}
					</span>
				) : (
					""
				)}
				{/* <p>Last searched: {sessionStorage.getItem("lastSearched")}</p> */}
			</header>

			{loading ? (
				<div class="lds-dual-ring"></div>
			) : error ? (
				<p>{error}</p>
			) : weather.main ? (
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
