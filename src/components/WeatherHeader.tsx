import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Bookmark } from 'lucide-react-native';
import { WeatherBackground } from './WeatherBackground';
import { WeatherIcon } from './WeatherIcon';
import { WeatherData, LocationData } from '../api/weather';

interface WeatherHeaderProps {
    location: LocationData | null;
    selectedHour: any;
    displayWeather: any;
    weatherInfo: any;
    weather: WeatherData;
    savedLocations: LocationData[];
    addSavedLocation: (location: LocationData) => void;
    removeSavedLocation: (id: number) => void;
    formatTemp: (temp: number) => number;
    borderColor: string;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
    location,
    selectedHour,
    displayWeather,
    weatherInfo,
    weather,
    savedLocations,
    addSavedLocation,
    removeSavedLocation,
    formatTemp,
    borderColor
}) => {
    if (!displayWeather || !weatherInfo) return null;

    return (
        <View className={`mx-4 mb-6 mt-2 rounded-[40px] overflow-hidden relative min-h-[500px] justify-center border ${borderColor}`}>
            {/* Animated Background for this section only */}
            <WeatherBackground
                code={displayWeather.weathercode}
                isDay={displayWeather.is_day === 1}
                style={{ width: '100%', height: '100%', position: 'absolute' }}
            />

            <View className="items-center py-10 z-10">
                <Text className="text-white text-3xl font-bold tracking-wider text-center shadow-lg">
                    {location?.name || 'Current Location'}
                </Text>
                <Text className="text-gray-200 text-sm font-medium mt-1 shadow-md">
                    {selectedHour
                        ? format(new Date(selectedHour.time), 'EEEE, h:mm a')
                        : format(new Date(), 'EEEE, d MMMM')
                    }
                </Text>

                <View className="my-8 shadow-2xl">
                    <WeatherIcon code={displayWeather.weathercode} isDay={displayWeather.is_day === 1} width={200} height={200} />
                </View>

                <Text className="text-white text-8xl font-bold tracking-tighter ml-4 shadow-lg">
                    {formatTemp(displayWeather.temperature)}°
                </Text>

                <Text className="text-white text-xl font-medium mt-2 tracking-widest uppercase shadow-md">
                    {weatherInfo.label}
                </Text>

                <View className="flex-row space-x-4 mt-3">
                    <Text className="text-gray-200 font-medium shadow-sm">H: {formatTemp(weather.daily.temperature_2m_max[0])}°</Text>
                    <Text className="text-gray-200 font-medium shadow-sm">L: {formatTemp(weather.daily.temperature_2m_min[0])}°</Text>
                </View>
            </View>

            {/* Save Location Button */}
            <TouchableOpacity
                onPress={() => {
                    if (!location) return;
                    const isSaved = savedLocations.some(l => l.id === location.id);
                    if (isSaved) {
                        removeSavedLocation(location.id);
                    } else {
                        addSavedLocation(location);
                    }
                }}
                className="absolute bottom-6 right-6 bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 shadow-lg z-50"
            >
                <Bookmark
                    size={24}
                    color="white"
                    fill={savedLocations.some(l => l.id === location?.id) ? "white" : "transparent"}
                />
            </TouchableOpacity>
        </View>
    );
};
