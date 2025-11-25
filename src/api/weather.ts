import axios from 'axios';

const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const HISTORICAL_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

export interface WeatherData {
    current_weather: {
        temperature: number;
        windspeed: number;
        winddirection: number;
        weathercode: number;
        is_day: number;
        time: string;
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weathercode: number[];
        sunrise: string[];
        sunset: string[];
        uv_index_max: number[];
        precipitation_sum: number[];
        precipitation_probability_max: number[];
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        weathercode: number[];
        relative_humidity_2m: number[];
        wind_speed_10m: number[];
        precipitation_probability: number[];
    };
}

export interface LocationData {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
}

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
    try {
        const response = await axios.get(FORECAST_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                current_weather: true,
                daily: 'temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max',
                hourly: 'temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m,precipitation_probability',
                timezone: 'auto',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};

export const searchCity = async (query: string): Promise<LocationData[]> => {
    try {
        const response = await axios.get(GEOCODING_API_URL, {
            params: {
                name: query,
                count: 5,
                language: 'en',
                format: 'json',
            },
        });
        return response.data.results || [];
    } catch (error) {
        console.error('Error searching city:', error);
        throw error;
    }
};

export const fetchHistory = async (lat: number, lon: number, startDate: string, endDate: string) => {
    try {
        const response = await axios.get(HISTORICAL_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                start_date: startDate,
                end_date: endDate,
                daily: 'temperature_2m_max,temperature_2m_min,weathercode',
                timezone: 'auto',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};
