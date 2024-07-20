import { useEffect, useRef, useState } from "react";
import {
	GoogleMap,
	Marker,
	useJsApiLoader,
	Autocomplete,
} from "@react-google-maps/api";
import "./App.css";
import { mapStyles } from "./mapStyles";

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

function getAddressComponent(components, type) {
	const component = components.find((c) => c.types.includes(type));
	return component ? component.long_name : "";
}

function App() {
	const api = {
		key: import.meta.env.VITE_WEATHER_API_KEY,
		mapsKey: import.meta.env.VITE_GOOGLE_MAPS_API,
		baseurlgeo: "https://api.openweathermap.org/geo/1.0/direct?",
		baseurlweather: "https://api.openweathermap.org/data/2.5/weather?",
	};

	const [location, setLocation] = useState("");
	const [state, setState] = useState("");
	const [country, setCountry] = useState("");
	const [weather, setWeather] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [input, setInput] = useState("");
	const [autocomplete, setAutocomplete] = useState(null);
	const [arrayOfSearches, setArrayOfSearches] = useState([]);

	const inputRef = useRef();

	useEffect(() => {
		if (autocomplete) {
			autocomplete.addListener("place_changed", handlePlaceChanged);
		}
	}, [autocomplete]);

	function handleKeyDown(event) {
		if (event.key === "Enter") {
			event.preventDefault();
			if (autocomplete) {
				handlePlaceChanged();
			}
		}
	}

	const handlePlaceChanged = () => {
		const place = autocomplete.getPlace();
		if (place && place.geometry) {
			const lat = place.geometry.location.lat();
			const lon = place.geometry.location.lng();
			const country = getAddressComponent(
				place.address_components,
				"country"
			);
			const state = getAddressComponent(
				place.address_components,
				"administrative_area_level_1"
			);
			setLocation(place.name);
			setCountry(country);
			setState(state);
			fetchWeatherData(lat, lon, place.name);

			setArrayOfSearches((prevArray) => {
				const newArray = [
					{ place: place.name, country, lat, lon },
					...prevArray,
				];
				if (newArray.length > 3) {
					newArray.pop();
				}
				return newArray;
			});
		}
	};

	function processLocation(ev, loc) {
		if (ev) ev.preventDefault();
		setLoading(true);
		setError(null);
		setWeather({});
		setLocation("");
		setState("");
		setCountry("");

		if (autocomplete) {
			const place = autocomplete.getPlace();
			if (place && place.geometry) {
				handlePlaceChanged();
			} else {
				setError("Location was not found!");
				setLoading(false);
			}
		} else {
			setError("Autocomplete not initialized");
			setLoading(false);
		}
	}

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

	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: api.mapsKey,
		libraries: ["places"],
	});

	const onLoad = (autocompleteInstance) => {
		setAutocomplete(autocompleteInstance);
	};

	function getDynamicFontSize(str) {
		const smolSize = 24;
		const midSize = 36;
		const maxSize = 48;

		if (str.length <= 10) {
			return `${maxSize}px`;
		} else if (str.length <= 18) {
			return `${midSize}px`;
		} else {
			return `${smolSize}px`;
		}
	}

	return (
		<div className="App">
			<header>
				<h1>Weather App</h1>
				<form onSubmit={processLocation}>
					{isLoaded && (
						<Autocomplete
							onLoad={onLoad}
							options={{
								types: ["(cities)"],
							}}
						>
							<input
								ref={inputRef}
								type="text"
								placeholder="enter location!"
								value={input}
								onChange={(ev) => setInput(ev.target.value)}
								onKeyDown={handleKeyDown}
							/>
						</Autocomplete>
					)}
					<button type="submit">Search</button>
				</form>

				{/* <div className="lastSearchedDiv">
					{arrayOfSearches.length > 1 && (
						<span className="lastSearched">
							Previous searches:{" "}
							{arrayOfSearches.slice(1, 3).map((search, index) => (
								<span key={index}>
									{index > 0 && ", "}
									<a
										href="#"
										onClick={() =>
											processLocation(undefined, search.place)
										}
									>
										{search.place}
									</a>
								</span>
							))}
						</span>
					)}
				</div> */}
			</header>

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
								style={{
									fontSize: getDynamicFontSize(location),
								}}
							>
								{location}
							</p>
							<div className="stateAndCountry">
								<p className="locationInfo">
									{state}, {country}
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
								Latitude: {Math.round(weather.coord.lat * 100) / 100}
							</p>
							<p>
								Longitude: {Math.round(weather.coord.lon * 100) / 100}
							</p>
						</div>
						<p>Feels like {Math.round(weather.main.feels_like)}°C</p>
						<p>
							{weather.weather[0].main} ({weather.weather[0].description}
							)
						</p>
						<p>Current time: {convertTimestamptoTime(weather.dt, 0)}</p>
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
					{isLoaded && (
						<GoogleMap
							key={`${weather.coord.lat}-${weather.coord.lon}`}
							mapContainerStyle={{ height: "400px", width: "100%" }}
							center={{ lat: weather.coord.lat, lng: weather.coord.lon }}
							zoom={10}
							options={{
								styles: mapStyles,
								disableDefaultUI: true,
							}}
						>
							<Marker
								position={{
									lat: weather.coord.lat,
									lng: weather.coord.lon,
								}}
								visible={true}
								zIndex={100}
							/>
						</GoogleMap>
					)}
				</div>
			) : (
				<p></p>
			)}
		</div>
	);
}

export default App;
