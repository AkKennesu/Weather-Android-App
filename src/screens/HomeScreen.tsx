import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import { MapPin, Calendar, Wind, Droplets } from 'lucide-react-native';

import { useWeather } from '../context/WeatherContext';
import { fetchWeather, WeatherData } from '../api/weather';
import { getWeatherInfo } from '../utils/weatherCodes';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { location, setLocation } = useWeather();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadWeather = async () => {
        try {
            let lat, lon;
            if (location) {
                lat = location.latitude;
                lon = location.longitude;
            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLoading(false);
                    return;
                }
                const currentLocation = await Location.getCurrentPositionAsync({});
                lat = currentLocation.coords.latitude;
                lon = currentLocation.coords.longitude;
                // Optionally reverse geocode to get name, but for now just use coords or "Current Location"
                // We can update context if we want, but maybe just local for now if context is empty
            }

            const data = await fetchWeather(lat, lon);
            setWeather(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadWeather();
    }, [location]);

    const onRefresh = () => {
        setRefreshing(true);
        loadWeather();
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    if (!weather) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white text-lg mb-4">No location selected</Text>
                <TouchableOpacity
                    className="bg-blue-500 px-6 py-3 rounded-full"
                    onPress={() => navigation.navigate('Search')}
                >
                    <Text className="text-white font-bold">Search Location</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const current = weather.current_weather;
    const weatherInfo = getWeatherInfo(current.weathercode);
    const Icon = weatherInfo.icon;

    return (
        <LinearGradient
            colors={['#1e3a8a', '#172554', '#0f172a']}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 py-4">
                        <TouchableOpacity
                            className="flex-row items-center space-x-2"
                            onPress={() => navigation.navigate('Search')}
                        >
                            <MapPin color="white" size={24} />
                            <Text className="text-white text-2xl font-bold">
                                {location?.name || 'Current Location'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Current Weather */}
                    <View className="items-center mt-10 mb-10">
                        <Icon size={120} color={weatherInfo.color} />
                        <Text className="text-white text-6xl font-bold mt-4">
                            {Math.round(current.temperature)}°
                        </Text>
                        <Text className="text-gray-300 text-xl capitalize mt-2">
                            {weatherInfo.label}
                        </Text>
                        <View className="flex-row space-x-6 mt-6">
                            <View className="flex-row items-center space-x-2">
                                <Wind color="gray" size={20} />
                                <Text className="text-gray-300">{current.windspeed} km/h</Text>
                            </View>
                            {/* Add more details if available from hourly/daily */}
                        </View>
                    </View>

                    {/* Forecast */}
                    <View className="px-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white text-xl font-bold">Next 7 Days</Text>
                            <Calendar color="white" size={20} />
                        </View>

                        <View className="bg-white/10 rounded-3xl p-4">
                            {weather.daily.time.map((date, index) => {
                                const code = weather.daily.weathercode[index];
                                const info = getWeatherInfo(code);
                                const DayIcon = info.icon;
                                const isToday = index === 0;

                                return (
                                    <View key={date} className="flex-row justify-between items-center py-3 border-b border-white/10 last:border-0">
                                        <Text className="text-white font-medium w-24">
                                            {isToday ? 'Today' : format(new Date(date), 'EEE, MMM d')}
                                        </Text>
                                        <View className="flex-row items-center flex-1 justify-center">
                                            <DayIcon size={24} color={info.color} />
                                            <Text className="text-gray-400 text-xs ml-2">{info.label}</Text>
                                        </View>
                                        <View className="flex-row w-20 justify-end space-x-2">
                                            <Text className="text-white font-bold">
                                                {Math.round(weather.daily.temperature_2m_max[index])}°
                                            </Text>
                                            <Text className="text-gray-400">
                                                {Math.round(weather.daily.temperature_2m_min[index])}°
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* History Button */}
                    <View className="px-6 mt-6">
                        <TouchableOpacity
                            className="bg-white/20 p-4 rounded-2xl flex-row justify-center items-center space-x-2"
                            onPress={() => navigation.navigate('History')}
                        >
                            <Calendar color="white" size={24} />
                            <Text className="text-white font-bold text-lg">View Last 10 Days History</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
