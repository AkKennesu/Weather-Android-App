import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, WeatherData, AirQualityData } from '../api/weather';

interface LayoutPreferences {
    showDailyForecast: boolean;
    showHourlyForecast: boolean;
    showActivities: boolean;
    showMoonPhase: boolean;
    showWeatherDetails: boolean;
    showWeatherMap: boolean;
}



export type LayoutSectionId = 'weatherDetails' | 'hourlyForecast' | 'activities' | 'moonPhase' | 'dailyForecast' | 'weatherMap';

type Theme = 'light' | 'dark';

interface WeatherContextType {
    location: LocationData | null;
    setLocation: (location: LocationData) => void;
    weather: WeatherData | null;
    setWeather: (weather: WeatherData | null) => void;
    airQuality: AirQualityData | null;
    setAirQuality: (data: AirQualityData | null) => void;
    units: 'celsius' | 'fahrenheit';
    setUnits: (units: 'celsius' | 'fahrenheit') => void;
    savedLocations: LocationData[];
    addSavedLocation: (location: LocationData) => void;
    removeSavedLocation: (id: number) => void;
    layoutPreferences: LayoutPreferences;
    toggleLayoutSection: (section: keyof LayoutPreferences) => void;
    layoutOrder: LayoutSectionId[];
    updateLayoutOrder: (order: LayoutSectionId[]) => void;
    theme: Theme;
    toggleTheme: () => void;
    enabledActivities: string[];
    toggleActivity: (activity: string) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocationState] = useState<LocationData | null>(null);
    const [weather, setWeatherState] = useState<WeatherData | null>(null);
    const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
    const [units, setUnits] = useState<'celsius' | 'fahrenheit'>('celsius');
    const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
    const [layoutPreferences, setLayoutPreferences] = useState<LayoutPreferences>({
        showDailyForecast: true,
        showHourlyForecast: true,
        showActivities: true,
        showMoonPhase: true,
        showWeatherDetails: true,
        showWeatherMap: true,
    });
    const [layoutOrder, setLayoutOrder] = useState<LayoutSectionId[]>([
        'weatherDetails',
        'hourlyForecast',
        'activities',
        'moonPhase',
        'dailyForecast',
        'weatherMap'
    ]);
    const [theme, setTheme] = useState<Theme>('dark');
    const [enabledActivities, setEnabledActivities] = useState<string[]>(['Running', 'Cycling', 'Gardening', 'Tennis', 'Badminton', 'Golf', 'Hiking', 'Camping']);

    useEffect(() => {
        const loadData = async () => {
            try {
                const savedLocation = await AsyncStorage.getItem('weather_location');
                const savedWeather = await AsyncStorage.getItem('weather_data');
                const savedAirQuality = await AsyncStorage.getItem('air_quality_data');
                const savedLocationsList = await AsyncStorage.getItem('saved_locations');
                const savedLayout = await AsyncStorage.getItem('layout_preferences');
                const savedOrder = await AsyncStorage.getItem('layout_order');
                const savedUnits = await AsyncStorage.getItem('weather_units');
                const savedTheme = await AsyncStorage.getItem('weather_theme');
                const savedActivities = await AsyncStorage.getItem('enabled_activities');

                if (savedLocation) setLocationState(JSON.parse(savedLocation));
                if (savedWeather) setWeatherState(JSON.parse(savedWeather));
                if (savedAirQuality) setAirQuality(JSON.parse(savedAirQuality));
                if (savedLocationsList) setSavedLocations(JSON.parse(savedLocationsList));
                if (savedLayout) setLayoutPreferences(JSON.parse(savedLayout));
                if (savedOrder) setLayoutOrder(JSON.parse(savedOrder));
                if (savedUnits) setUnits(savedUnits as 'celsius' | 'fahrenheit');
                if (savedTheme) setTheme(savedTheme as Theme);
                if (savedActivities) setEnabledActivities(JSON.parse(savedActivities));
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

    const setAirQualityState = async (newAirQuality: AirQualityData | null) => {
        setAirQuality(newAirQuality);
        if (newAirQuality) {
            try {
                await AsyncStorage.setItem('air_quality_data', JSON.stringify(newAirQuality));
            } catch (error) {
                console.error('Failed to save air quality data', error);
            }
        }
    };

    const addSavedLocation = async (newLocation: LocationData) => {
        const updatedLocations = [...savedLocations, newLocation];
        setSavedLocations(updatedLocations);
        try {
            await AsyncStorage.setItem('saved_locations', JSON.stringify(updatedLocations));
        } catch (error) {
            console.error('Failed to save locations list', error);
        }
    };

    const removeSavedLocation = async (id: number) => {
        const updatedLocations = savedLocations.filter(loc => loc.id !== id);
        setSavedLocations(updatedLocations);
        try {
            await AsyncStorage.setItem('saved_locations', JSON.stringify(updatedLocations));
        } catch (error) {
            console.error('Failed to save locations list', error);
        }
    };

    const toggleLayoutSection = async (section: keyof LayoutPreferences) => {
        const updatedLayout = { ...layoutPreferences, [section]: !layoutPreferences[section] };
        setLayoutPreferences(updatedLayout);
        try {
            await AsyncStorage.setItem('layout_preferences', JSON.stringify(updatedLayout));
        } catch (error) {
            console.error('Failed to save layout preferences', error);
        }
    };

    const updateLayoutOrder = async (order: LayoutSectionId[]) => {
        setLayoutOrder(order);
        try {
            await AsyncStorage.setItem('layout_order', JSON.stringify(order));
        } catch (error) {
            console.error('Failed to save layout order', error);
        }
    };

    const updateUnits = async (newUnits: 'celsius' | 'fahrenheit') => {
        setUnits(newUnits);
        try {
            await AsyncStorage.setItem('weather_units', newUnits);
        } catch (error) {
            console.error('Failed to save units', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('weather_theme', newTheme);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const toggleActivity = async (activity: string) => {
        const updatedActivities = enabledActivities.includes(activity)
            ? enabledActivities.filter(a => a !== activity)
            : [...enabledActivities, activity];

        setEnabledActivities(updatedActivities);
        try {
            await AsyncStorage.setItem('enabled_activities', JSON.stringify(updatedActivities));
        } catch (error) {
            console.error('Failed to save enabled activities', error);
        }
    };

    return (
        <WeatherContext.Provider value={{
            location,
            setLocation,
            weather,
            setWeather,
            airQuality,
            setAirQuality: setAirQualityState,
            units,
            setUnits: updateUnits,
            savedLocations,
            addSavedLocation,
            removeSavedLocation,
            layoutPreferences,
            toggleLayoutSection,
            layoutOrder,
            updateLayoutOrder,
            theme,
            toggleTheme,
            enabledActivities,
            toggleActivity
        }}>
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
