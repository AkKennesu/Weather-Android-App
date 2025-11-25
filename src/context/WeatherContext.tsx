import React, { createContext, useState, useContext, ReactNode } from 'react';
import { LocationData } from '../api/weather';

interface WeatherContextType {
    location: LocationData | null;
    setLocation: (location: LocationData) => void;
    units: 'celsius' | 'fahrenheit';
    setUnits: (units: 'celsius' | 'fahrenheit') => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [units, setUnits] = useState<'celsius' | 'fahrenheit'>('celsius');

    return (
        <WeatherContext.Provider value={{ location, setLocation, units, setUnits }}>
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
