import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, WeatherData } from '../api/weather';

interface WeatherContextType {
    location: LocationData | null;
    setLocation: (location: LocationData) => void;
    weather: WeatherData | null;
    setWeather: (weather: WeatherData | null) => void;
    units: 'celsius' | 'fahrenheit';
    setUnits: (units: 'celsius' | 'fahrenheit') => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocationState] = useState<LocationData | null>(null);
    const [weather, setWeatherState] = useState<WeatherData | null>(null);
    const [units, setUnits] = useState<'celsius' | 'fahrenheit'>('celsius');

    useEffect(() => {
        const loadData = async () => {
            try {
                const savedLocation = await AsyncStorage.getItem('weather_location');
                const savedWeather = await AsyncStorage.getItem('weather_data');

                if (savedLocation) {
                    setLocationState(JSON.parse(savedLocation));
                }
                if (savedWeather) {
                    setWeatherState(JSON.parse(savedWeather));
                }
            } catch (error) {
                console.error('Failed to load weather data from storage', error);
            }
        };
        loadData();
    }, []);

    const setLocation = async (newLocation: LocationData) => {
        setLocationState(newLocation);
        try {
            await AsyncStorage.setItem('weather_location', JSON.stringify(newLocation));
        } catch (error) {
            console.error('Failed to save location', error);
        }
    };

    const setWeather = async (newWeather: WeatherData | null) => {
        setWeatherState(newWeather);
        if (newWeather) {
            try {
                await AsyncStorage.setItem('weather_data', JSON.stringify(newWeather));
            } catch (error) {
                console.error('Failed to save weather data', error);
            }
        }
    };

    return (
        <WeatherContext.Provider value={{ location, setLocation, weather, setWeather, units, setUnits }}>
            {children}
        </WeatherContext.Provider>
    );
};

export const useWeather = () => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
};
