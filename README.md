# Weather App

Weather App is a React-based application that allows users to search for the current weather conditions in a specified location. It utilizes the OpenWeatherMap API to fetch geographical data and weather information and the Google Maps API to display the location on a map.

## Features

-  Search for current weather by city name
-  Displays temperature, weather conditions, and other relevant information
-  Stores the last searched location in session storage for quick reference
-  Responsive and user-friendly interface
-  Integration with Google Maps to show the searched location

## Technologies Used

-  React
-  Vite
-  OpenWeatherMap API
-  Google Maps API
-  CSS

## Installation

1. Clone the repository to your local machine:

   ```sh
   git clone https://github.com/kryturek/weather-app.git
   cd weather-app
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root of the project and add your OpenWeatherMap API key and Google Maps API key:

   ```
   VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
   VITE_GOOGLE_MAPS_API=your_google_maps_api_key_here
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## Usage

1. Open the application in your web browser:

   ```
   http://localhost:5173
   ```

2. Enter a city name into the input field and click "Search".

3. The app will display the current weather conditions for the entered location, including temperature, weather description, an icon representing the weather, and a Google Map showing the location.

## Code Overview

The main functionality is implemented in the `App.jsx` file. Here's a brief overview:

### State Management:

-  `location`: Stores the input from the user.
-  `geoData`: Stores the geographical data fetched from the OpenWeatherMap API.
-  `weather`: Stores the weather data fetched from the OpenWeatherMap API.
-  `loading`: Indicates whether the app is currently fetching data.
-  `error`: Stores any error messages.
-  `input`: Stores the current input value.
-  `lastSearched`: Stores the last searched location, retrieved from session storage.

### API Configuration:

```javascript
const api = {
	key: import.meta.env.VITE_WEATHER_API_KEY,
	mapsKey: import.meta.env.VITE_GOOGLE_MAPS_API,
	baseurlgeo: "https://api.openweathermap.org/geo/1.0/direct?",
	baseurlweather: "https://api.openweathermap.org/data/2.5/weather?",
};
```

### Functions:

-  `processLocation(ev, loc)`: Handles form submission, fetches geographical and weather data, and updates the state accordingly.
-  `handleLastSearchedClick(lastSearchedLocation)`: Handles the click event for the last searched location.

### Rendering:

-  Displays a form for user input.
-  Shows a loading spinner, error messages, or weather information based on the state.
-  Integrates a Google Map to display the searched location.

## License

This project is licensed under the Unlicense. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

If you have any questions or feedback, please reach out to me at [krytu.dev@gmail.com].

**Note:** Remember to replace `your_openweathermap_api_key_here` and `your_google_maps_api_key_here` with your actual API keys in the `.env` file.

```

```
