# Android Weather App Walkthrough

## Overview
I have built a modern Android weather application using React Native (Expo) and the Open-Meteo API. The app features current weather, a 7-day forecast, location search, and a 10-day history view.

## Features
- **Current Weather**: Displays temperature, condition, and wind speed.
- **Forecast**: 7-day daily forecast with high/low temps and conditions.
- **Search**: Search for any city globally using Open-Meteo Geocoding.
- **History**: View weather data for the past 10 days.
- **Modern UI**: Dark mode themed with gradients and clean typography using NativeWind (Tailwind CSS).

## Project Structure
- `App.tsx`: Main entry point with Navigation setup.
- `src/api/weather.ts`: API client for Open-Meteo.
- `src/components`: (Integrated into screens for simplicity).
- `src/screens`:
  - `HomeScreen.tsx`: Main dashboard.
  - `SearchScreen.tsx`: Location search.
  - `HistoryScreen.tsx`: Historical data.
- `src/context/WeatherContext.tsx`: Global state for selected location.

## How to Run
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start the App**:
   ```bash
   npx expo start
   ```
3. **Run on Android**:
   - Scan the QR code with the **Expo Go** app on your Android device.
   - Or press `a` to run on an Android Emulator.

## Verification
I have verified the API integration using a test script (`verify_api.ts`).
- `searchCity`: Works and returns locations.
- `fetchWeather`: Returns current and forecast data.
- `fetchHistory`: Returns past 10 days data.

## Notes
- The app uses `expo-location` to request permissions and get the current location on first load.
- Styling is handled by `nativewind`, allowing for rapid UI development with Tailwind classes.
