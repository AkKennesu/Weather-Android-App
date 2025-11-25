import axios from 'axios';

const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const HISTORICAL_API_URL = 'https://archive-api.open-meteo.com/v1/archive';
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

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
        daylight_duration: number[];
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        apparent_temperature: number[];
        weathercode: number[];
        relative_humidity_2m: number[];
        wind_speed_10m: number[];
        precipitation_probability: number[];
        surface_pressure: number[];
        visibility: number[];
        cloud_cover: number[];
        snowfall: number[];
        precipitation: number[];
    };
}

export interface AirQualityData {
    current: {
        time: string;
        pm10: number;
        pm2_5: number;
        carbon_monoxide: number;
        nitrogen_dioxide: number;
        sulphur_dioxide: number;
        ozone: number;
        uv_index: number;
        alder_pollen: number;
        birch_pollen: number;
        grass_pollen: number;
        mugwort_pollen: number;
        olive_pollen: number;
        ragweed_pollen: number;
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
                daily: 'temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,daylight_duration',
                hourly: 'temperature_2m,apparent_temperature,weathercode,relative_humidity_2m,wind_speed_10m,precipitation_probability,surface_pressure,visibility,cloud_cover,snowfall,precipitation',
                timezone: 'auto',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};

export const fetchAirQuality = async (lat: number, lon: number): Promise<AirQualityData> => {
    try {
        const response = await axios.get(AIR_QUALITY_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
                timezone: 'auto',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching air quality:', error);
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
