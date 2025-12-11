import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { LocationData, WeatherData, AirQualityData } from '../api/weather';
import { storage, STORAGE_KEYS } from '../utils/storage';

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

export type SectionSize = 'small' | 'medium' | 'large';

interface WeatherContextType {
    location: LocationData | null;
    setLocation: (location: LocationData) => void;
    weather: WeatherData | null;
    setWeather: (weather: WeatherData | null) => void;
    airQuality: AirQualityData | null;
    setAirQuality: (data: AirQualityData | null) => void;
    units: 'celsius' | 'fahrenheit';
    setUnits: (units: 'celsius' | 'fahrenheit') => void;
    iconSet: 'default' | 'monochrome';
    setIconSet: (set: 'default' | 'monochrome') => void;
    layoutDensity: 'comfortable' | 'compact';
    setLayoutDensity: (density: 'comfortable' | 'compact') => void;
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
    sectionSizes: Record<LayoutSectionId, SectionSize>;
    setSectionSize: (section: LayoutSectionId, size: SectionSize) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocationState] = useState<LocationData | null>(null);
    const [weather, setWeatherState] = useState<WeatherData | null>(null);
    const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
    const [units, setUnits] = useState<'celsius' | 'fahrenheit'>('celsius');
    const [iconSet, setIconSet] = useState<'default' | 'monochrome'>('default');
    const [layoutDensity, setLayoutDensity] = useState<'comfortable' | 'compact'>('comfortable');
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
    const [sectionSizes, setSectionSizes] = useState<Record<LayoutSectionId, SectionSize>>({
        weatherDetails: 'medium',
        hourlyForecast: 'medium',
        activities: 'medium',
        moonPhase: 'medium',
        dailyForecast: 'medium',
        weatherMap: 'medium'
    });
    const [theme, setTheme] = useState<Theme>('dark');
    const [enabledActivities, setEnabledActivities] = useState<string[]>(['Running', 'Cycling', 'Gardening', 'Tennis', 'Badminton', 'Golf', 'Hiking', 'Camping']);

    useEffect(() => {
        const loadData = async () => {
            const savedLocation = await storage.get<LocationData>(STORAGE_KEYS.LOCATION);
            const savedWeather = await storage.get<WeatherData>(STORAGE_KEYS.WEATHER_DATA);
            const savedAirQuality = await storage.get<AirQualityData>(STORAGE_KEYS.AIR_QUALITY);
            const savedLocationsList = await storage.get<LocationData[]>(STORAGE_KEYS.SAVED_LOCATIONS);
            const savedLayout = await storage.get<LayoutPreferences>(STORAGE_KEYS.LAYOUT_PREFERENCES);
            const savedOrder = await storage.get<LayoutSectionId[]>(STORAGE_KEYS.LAYOUT_ORDER);
            const savedUnits = await storage.get<'celsius' | 'fahrenheit'>(STORAGE_KEYS.UNITS);
            const savedTheme = await storage.get<Theme>(STORAGE_KEYS.THEME);
            const savedActivities = await storage.get<string[]>(STORAGE_KEYS.ENABLED_ACTIVITIES);
            const savedIconSet = await storage.get<'default' | 'monochrome'>(STORAGE_KEYS.ICON_SET);
            const savedDensity = await storage.get<'comfortable' | 'compact'>(STORAGE_KEYS.LAYOUT_DENSITY);
            const savedSizes = await storage.get<Record<LayoutSectionId, SectionSize>>(STORAGE_KEYS.SECTION_SIZES);

            if (savedLocation) setLocationState(savedLocation);
            if (savedWeather) setWeatherState(savedWeather);
            if (savedAirQuality) setAirQuality(savedAirQuality);
            if (savedLocationsList) setSavedLocations(savedLocationsList);
            if (savedLayout) setLayoutPreferences(savedLayout);
            if (savedOrder) setLayoutOrder(savedOrder);
            if (savedUnits) setUnits(savedUnits);
            if (savedTheme) setTheme(savedTheme);
            if (savedActivities) setEnabledActivities(savedActivities);
            if (savedIconSet) setIconSet(savedIconSet);
            if (savedDensity) setLayoutDensity(savedDensity);
            if (savedSizes) setSectionSizes({ ...sectionSizes, ...savedSizes });
        };
        loadData();
    }, []);

    const setLocation = async (newLocation: LocationData) => {
        setLocationState(newLocation);
        await storage.set(STORAGE_KEYS.LOCATION, newLocation);
    };

    const setWeather = async (newWeather: WeatherData | null) => {
        setWeatherState(newWeather);
        if (newWeather) {
            await storage.set(STORAGE_KEYS.WEATHER_DATA, newWeather);
        }
    };

    const setAirQualityState = async (newAirQuality: AirQualityData | null) => {
        setAirQuality(newAirQuality);
        if (newAirQuality) {
            await storage.set(STORAGE_KEYS.AIR_QUALITY, newAirQuality);
        }
    };

    const updateIconSet = async (set: 'default' | 'monochrome') => {
        setIconSet(set);
        await storage.set(STORAGE_KEYS.ICON_SET, set);
    };

    const updateLayoutDensity = async (density: 'comfortable' | 'compact') => {
        setLayoutDensity(density);
        await storage.set(STORAGE_KEYS.LAYOUT_DENSITY, density);
    };

    const addSavedLocation = async (newLocation: LocationData) => {
        const updatedLocations = [...savedLocations, newLocation];
        setSavedLocations(updatedLocations);
        await storage.set(STORAGE_KEYS.SAVED_LOCATIONS, updatedLocations);
    };

    const removeSavedLocation = async (id: number) => {
        const updatedLocations = savedLocations.filter(loc => loc.id !== id);
        setSavedLocations(updatedLocations);
        await storage.set(STORAGE_KEYS.SAVED_LOCATIONS, updatedLocations);
    };

    const toggleLayoutSection = async (section: keyof LayoutPreferences) => {
        const updatedLayout = { ...layoutPreferences, [section]: !layoutPreferences[section] };
        setLayoutPreferences(updatedLayout);
        await storage.set(STORAGE_KEYS.LAYOUT_PREFERENCES, updatedLayout);
    };

    const updateLayoutOrder = async (order: LayoutSectionId[]) => {
        setLayoutOrder(order);
        await storage.set(STORAGE_KEYS.LAYOUT_ORDER, order);
    };

    const setSectionSize = async (section: LayoutSectionId, size: SectionSize) => {
        const updatedSizes = { ...sectionSizes, [section]: size };
        setSectionSizes(updatedSizes);
        await storage.set(STORAGE_KEYS.SECTION_SIZES, updatedSizes);
    };

    const updateUnits = async (newUnits: 'celsius' | 'fahrenheit') => {
        setUnits(newUnits);
        await storage.set(STORAGE_KEYS.UNITS, newUnits);
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        await storage.set(STORAGE_KEYS.THEME, newTheme);
    };

    const toggleActivity = async (activity: string) => {
        const updatedActivities = enabledActivities.includes(activity)
            ? enabledActivities.filter(a => a !== activity)
            : [...enabledActivities, activity];

        setEnabledActivities(updatedActivities);
        await storage.set(STORAGE_KEYS.ENABLED_ACTIVITIES, updatedActivities);
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
            iconSet,
            setIconSet: updateIconSet,
            layoutDensity,
            setLayoutDensity: updateLayoutDensity,
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
            toggleActivity,
            sectionSizes,
            setSectionSize
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
