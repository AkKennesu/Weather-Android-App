import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import { MapPin, Calendar, Wind, Search, Clock, Droplets, CloudRain, Moon, Sunrise, Sunset, Sun } from 'lucide-react-native';

import { useWeather } from '../context/WeatherContext';
import { fetchWeather, searchCity, WeatherData, LocationData } from '../api/weather';
import { getWeatherInfo } from '../utils/weatherCodes';
import { getMoonPhase } from '../utils/moonPhase';
import { getWeatherTip, getActivityAnalysis } from '../utils/activitySuggestions';

import { WeatherIcon } from '../components/WeatherIcon';
import { WeatherBackground } from '../components/WeatherBackground';
import { WeatherDetails } from '../components/WeatherDetails';
import { ActivityCard } from '../components/ActivityCard';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { location, setLocation, weather, setWeather } = useWeather();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationData[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Interactive State
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedHour, setSelectedHour] = useState<any>(null);
    const [dailyModalVisible, setDailyModalVisible] = useState(false);
    const [selectedDailyDetails, setSelectedDailyDetails] = useState<any>(null);

    // Rate Limiting Refs
    const lastFetchTime = React.useRef<number>(0);
    const lastFetchCoords = React.useRef<{ lat: number, lon: number } | null>(null);

    const loadWeather = useCallback(async (force = false) => {
        try {
            let lat, lon;
            let locationName = location?.name;

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

                // Reverse geocode to get city name
                const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
                if (reverseGeocode.length > 0) {
                    const address = reverseGeocode[0];
                    locationName = address.city || address.region || address.country || 'Current Location';

                    if (!location) {
                        setLocation({
                            id: 0,
                            name: locationName,
                            latitude: lat,
                            longitude: lon,
                            country: address.country || ''
                        });
                    }
                }
            }

            // Rate Limiting Check
            const now = Date.now();
            const isSameLocation = lastFetchCoords.current &&
                Math.abs(lastFetchCoords.current.lat - lat) < 0.01 &&
                Math.abs(lastFetchCoords.current.lon - lon) < 0.01;

            if (!force && isSameLocation && (now - lastFetchTime.current < 600000) && weather) {
                setLoading(false);
                setRefreshing(false);
                return; // Skip fetch if within 10 mins and same location
            }

            const data = await fetchWeather(lat, lon);
            setWeather(data);
            lastFetchTime.current = now;
            lastFetchCoords.current = { lat, lon };

            // Set default selected date to today
            if (data && data.daily && data.daily.time.length > 0) {
                setSelectedDate(data.daily.time[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [location, setLocation, setWeather, weather]);

    useEffect(() => {
        loadWeather();
    }, [loadWeather]);

    const onRefresh = () => {
        setRefreshing(true);
        loadWeather(true); // Force refresh
    };

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 2) {
            setIsSearching(true);
            try {
                const data = await searchCity(text);
                setSearchResults(data);
            } catch (error) {
                console.error(error);
            }
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const selectLocation = (item: LocationData) => {
        setLocation(item);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        setSelectedHour(null); // Reset selected hour on location change
    };

    const handleDayClick = (index: number) => {
        if (!weather) return;
        const date = weather.daily.time[index];
        setSelectedDate(date);
        setSelectedHour(null); // Reset hour selection when changing days

        setSelectedDailyDetails({
            date: date,
            maxTemp: weather.daily.temperature_2m_max[index],
            minTemp: weather.daily.temperature_2m_min[index],
            weathercode: weather.daily.weathercode[index],
            sunrise: weather.daily.sunrise ? weather.daily.sunrise[index] : null,
            sunset: weather.daily.sunset ? weather.daily.sunset[index] : null,
            uvIndex: weather.daily.uv_index_max ? weather.daily.uv_index_max[index] : null,
            precipSum: weather.daily.precipitation_sum ? weather.daily.precipitation_sum[index] : null,
            precipProb: weather.daily.precipitation_probability_max ? weather.daily.precipitation_probability_max[index] : null,
        });
        setDailyModalVisible(true);
    };

    const handleHourClick = (index: number, actualIndex: number) => {
        if (!weather) return;
        const hourData = {
            time: weather.hourly.time[actualIndex],
            temperature: weather.hourly.temperature_2m[actualIndex],
            weathercode: weather.hourly.weathercode[actualIndex],
            windspeed: weather.hourly.wind_speed_10m ? weather.hourly.wind_speed_10m[actualIndex] : 0,
            is_day: 1, // Approximate, or calculate based on time
            humidity: weather.hourly.relative_humidity_2m ? weather.hourly.relative_humidity_2m[actualIndex] : 0,
            precipitation: weather.hourly.precipitation_probability ? weather.hourly.precipitation_probability[actualIndex] : 0,
        };

        // Determine is_day based on hour (simple logic)
        const hour = new Date(hourData.time).getHours();
        hourData.is_day = (hour >= 6 && hour < 18) ? 1 : 0;

        setSelectedHour(hourData);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#0f172a]">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    // Determine what to display: Selected Hour OR Current Weather
    const displayWeather = selectedHour || weather?.current_weather;
    const weatherInfo = displayWeather ? getWeatherInfo(displayWeather.weathercode) : null;

    // Filter hourly data for the selected date
    const getHourlyForDate = () => {
        if (!weather || !selectedDate) return [];

        const indices: number[] = [];
        weather.hourly.time.forEach((time, index) => {
            // Simple string matching is more reliable than Date objects for this API
            // time is "YYYY-MM-DDTHH:mm", selectedDate is "YYYY-MM-DD"
            if (time.startsWith(selectedDate)) {
                indices.push(index);
            }
        });
        return indices;
    };

    const hourlyIndices = getHourlyForDate();

    return (
        <View className="flex-1 bg-[#0f172a]">
            {/* Background Gradient - Always visible */}
            <LinearGradient
                colors={['#1e1b4b', '#0f172a']}
                className="absolute left-0 right-0 top-0 h-full"
            />

            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header & Search */}
                    <View className="px-4 pt-2 pb-4 z-50 flex-row items-center space-x-3">
                        <View className="flex-1 flex-row items-center bg-[#1e293b] rounded-full px-4 py-3 border border-white/10">
                            <Search color="#94a3b8" size={20} />
                            <TextInput
                                placeholder="Search city..."
                                placeholderTextColor="#94a3b8"
                                className="flex-1 ml-3 text-white text-base"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); }}>
                                    <Text className="text-gray-400">X</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <View className="absolute top-20 left-4 right-16 bg-[#1e293b] rounded-2xl p-2 z-50 shadow-lg border border-white/10">
                            {searchResults.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className="flex-row items-center p-3 border-b border-white/5 last:border-0"
                                    onPress={() => selectLocation(item)}
                                >
                                    <MapPin size={16} color="#94a3b8" />
                                    <Text className="text-white ml-2">{item.name}, {item.country}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {weather && displayWeather && weatherInfo ? (
                        <>
                            {/* Main Weather Info (Centered with Animated Background) */}
                            <View className="mx-4 mb-6 mt-4 rounded-[40px] overflow-hidden relative min-h-[500px] justify-center border border-white/10">
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
                                        {Math.round(displayWeather.temperature)}°
                                    </Text>

                                    <Text className="text-white text-xl font-medium mt-2 tracking-widest uppercase shadow-md">
                                        {weatherInfo.label}
                                    </Text>

                                    <View className="flex-row space-x-4 mt-3">
                                        <Text className="text-gray-200 font-medium shadow-sm">H: {Math.round(weather.daily.temperature_2m_max[0])}°</Text>
                                        <Text className="text-gray-200 font-medium shadow-sm">L: {Math.round(weather.daily.temperature_2m_min[0])}°</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Weather Details Grid */}
                            <WeatherDetails
                                windSpeed={displayWeather.windspeed}
                                humidity={selectedHour ? displayWeather.humidity : weather.hourly.relative_humidity_2m[0]}
                                precipitation={selectedHour ? displayWeather.precipitation : weather.hourly.precipitation_probability[0]}
                            />
                            <View className="mb-8" />

                            {/* Hourly Forecast (Filtered by Selected Date) */}
                            <View className="mb-6">
                                <View className="flex-row items-center px-6 mb-3 justify-between">
                                    <View className="flex-row items-center">
                                        <Clock size={18} color="#94a3b8" />
                                        <Text className="text-white font-bold ml-2">
                                            {selectedDate && format(new Date(selectedDate), 'EEEE')} Forecast
                                        </Text>
                                    </View>

                                    {/* Return to Present Button */}
                                    {(selectedHour || (selectedDate && !new Date(selectedDate).toDateString().includes(new Date().toDateString()))) && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedHour(null);
                                                if (weather && weather.daily.time.length > 0) {
                                                    setSelectedDate(weather.daily.time[0]);
                                                }
                                            }}
                                            className="bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/50"
                                        >
                                            <Text className="text-blue-400 text-xs font-bold">Return to Now</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                                    {hourlyIndices.map((actualIndex) => {
                                        const time = weather.hourly.time[actualIndex];
                                        const date = new Date(time);
                                        const hour = format(date, 'h a');
                                        const code = weather.hourly.weathercode[actualIndex];

                                        // Highlight selected hour
                                        const isSelected = selectedHour && selectedHour.time === time;

                                        // Simple day/night check based on hour (6am-6pm)
                                        const hourNum = date.getHours();
                                        const isDay = hourNum >= 6 && hourNum < 18;

                                        return (
                                            <TouchableOpacity
                                                key={time}
                                                onPress={() => handleHourClick(0, actualIndex)} // Pass actual index
                                                className={`items-center justify-center w-16 py-4 mr-3 rounded-3xl ${isSelected ? 'bg-[#3b82f6] border-2 border-white' : 'bg-[#1e293b] border border-white/5'}`}
                                            >
                                                <Text className={`text-xs mb-2 ${isSelected ? 'text-white font-bold' : 'text-gray-400'}`}>{hour}</Text>
                                                <WeatherIcon code={code} isDay={isDay} width={32} height={32} />
                                                <Text className={`text-sm font-bold mt-2 ${isSelected ? 'text-white' : 'text-white'}`}>
                                                    {Math.round(weather.hourly.temperature_2m[actualIndex])}°
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                            {/* Weather Tip */}
                            <View className="px-4 mb-6">
                                <View className="bg-blue-500/10 rounded-3xl p-4 border border-blue-500/20 flex-row items-center">
                                    <View className="bg-blue-500/20 p-2 rounded-full mr-3">
                                        <Wind size={20} color="#60a5fa" />
                                    </View>
                                    <Text className="text-blue-200 font-medium flex-1">
                                        {getWeatherTip(weather.current_weather)}
                                    </Text>
                                </View>
                            </View>

                            {/* Activities */}
                            <View className="mb-6">
                                <View className="flex-row items-center px-6 mb-3">
                                    <Text className="text-white font-bold text-lg">Activities</Text>
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 16 }}
                                >
                                    {getActivityAnalysis(weather).map((activity, index) => (
                                        <ActivityCard key={index} data={activity} />
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Moon Phase */}
                            <View className="px-4 mb-6">
                                <View className="bg-[#1e293b] rounded-3xl p-5 border border-white/5 flex-row items-center justify-between">
                                    <View>
                                        <View className="flex-row items-center mb-2">
                                            <Moon size={18} color="#94a3b8" />
                                            <Text className="text-white font-bold ml-2">Moon Phase</Text>
                                        </View>
                                        <Text className="text-white text-lg font-medium">{getMoonPhase(new Date()).label}</Text>
                                        <Text className="text-gray-400 text-sm">Illumination: {Math.round(getMoonPhase(new Date()).fraction * 100)}%</Text>
                                    </View>
                                    <View>
                                        {(() => {
                                            const PhaseIcon = getMoonPhase(new Date()).icon;
                                            return <PhaseIcon size={40} color="#e2e8f0" />;
                                        })()}
                                    </View>
                                </View>
                            </View>

                            {/* Daily Forecast (Clickable) */}
                            <View className="px-4 mb-20">
                                <View className="flex-row items-center mb-4 px-2">
                                    <Calendar size={20} color="#94a3b8" />
                                    <Text className="text-white font-bold ml-2 text-lg">Next 7 Days</Text>
                                </View>
                                <View className="bg-[#1e293b]/30 rounded-3xl p-4 border border-white/5">
                                    {weather.daily.time.map((date, index) => {
                                        const code = weather.daily.weathercode[index];
                                        const info = getWeatherInfo(code);
                                        const isToday = index === 0;
                                        const isSelected = selectedDate === date;

                                        return (
                                            <TouchableOpacity
                                                key={date}
                                                onPress={() => handleDayClick(index)}
                                                className={`flex-row justify-between items-center py-5 border-b border-white/5 last:border-0 ${isSelected ? 'bg-white/10 -mx-4 px-4' : ''}`}
                                            >
                                                <Text className={`font-medium w-24 text-base ${isSelected ? 'text-blue-400 font-bold' : 'text-white'}`}>
                                                    {isToday ? 'Today' : format(new Date(date), 'EEEE')}
                                                </Text>
                                                <View className="flex-row items-center flex-1 justify-center">
                                                    <View className="flex-col items-center">
                                                        <WeatherIcon code={code} isDay={true} width={40} height={40} />
                                                        <Text className="text-[10px] text-gray-400 mt-1 font-medium">{info.label}</Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row w-24 justify-end items-center space-x-4">
                                                    <Text className="text-white font-bold text-lg">
                                                        {Math.round(weather.daily.temperature_2m_max[index])}°
                                                    </Text>
                                                    <Text className="text-gray-500 text-lg">
                                                        {Math.round(weather.daily.temperature_2m_min[index])}°
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </>
                    ) : (
                        <View className="flex-1 justify-center items-center mt-20">
                            <Text className="text-gray-400">Search for a city to see the weather.</Text>
                        </View>
                    )}

                </ScrollView>

                {/* Floating History Button */}
                <View className="absolute bottom-6 right-6">
                    <TouchableOpacity
                        className="bg-[#3b82f6] p-4 rounded-full shadow-lg shadow-blue-500/50"
                        onPress={() => navigation.navigate('History')}
                    >
                        <Calendar color="white" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Daily Forecast Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={dailyModalVisible}
                    onRequestClose={() => setDailyModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setDailyModalVisible(false)}>
                        <View className="flex-1 justify-center items-center bg-black/60">
                            <TouchableWithoutFeedback>
                                <View className="bg-[#1e293b] m-4 p-6 rounded-3xl w-[85%] border border-white/10 shadow-2xl">
                                    {selectedDailyDetails && (
                                        <>
                                            <View className="items-center mb-6">
                                                <Text className="text-white text-2xl font-bold mb-1">
                                                    {format(new Date(selectedDailyDetails.date), 'EEEE, d MMMM')}
                                                </Text>
                                                <Text className="text-gray-400 text-lg">
                                                    {getWeatherInfo(selectedDailyDetails.weathercode).label}
                                                </Text>
                                            </View>

                                            <View className="flex-row justify-center items-center mb-8 bg-[#0f172a] rounded-2xl p-4">
                                                <WeatherIcon code={selectedDailyDetails.weathercode} isDay={true} width={80} height={80} />
                                                <View className="ml-6">
                                                    <View className="flex-row items-end">
                                                        <Text className="text-white text-5xl font-bold">{Math.round(selectedDailyDetails.maxTemp)}°</Text>
                                                        <Text className="text-gray-400 text-xl mb-2 ml-2">/ {Math.round(selectedDailyDetails.minTemp)}°</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="flex-row flex-wrap justify-between">
                                                {selectedDailyDetails.sunrise && (
                                                    <View className="w-[48%] bg-[#0f172a] p-3 rounded-xl mb-3 flex-row items-center">
                                                        <Sunrise size={20} color="#fbbf24" />
                                                        <View className="ml-3">
                                                            <Text className="text-gray-400 text-xs">Sunrise</Text>
                                                            <Text className="text-white font-bold">{format(new Date(selectedDailyDetails.sunrise), 'h:mm a')}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedDailyDetails.sunset && (
                                                    <View className="w-[48%] bg-[#0f172a] p-3 rounded-xl mb-3 flex-row items-center">
                                                        <Sunset size={20} color="#f97316" />
                                                        <View className="ml-3">
                                                            <Text className="text-gray-400 text-xs">Sunset</Text>
                                                            <Text className="text-white font-bold">{format(new Date(selectedDailyDetails.sunset), 'h:mm a')}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedDailyDetails.uvIndex !== null && (
                                                    <View className="w-[48%] bg-[#0f172a] p-3 rounded-xl mb-3 flex-row items-center">
                                                        <Sun size={20} color="#facc15" />
                                                        <View className="ml-3">
                                                            <Text className="text-gray-400 text-xs">Max UV Index</Text>
                                                            <Text className="text-white font-bold">{selectedDailyDetails.uvIndex}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedDailyDetails.precipProb !== null && (
                                                    <View className="w-[48%] bg-[#0f172a] p-3 rounded-xl mb-3 flex-row items-center">
                                                        <CloudRain size={20} color="#60a5fa" />
                                                        <View className="ml-3">
                                                            <Text className="text-gray-400 text-xs">Rain Chance</Text>
                                                            <Text className="text-white font-bold">{selectedDailyDetails.precipProb}%</Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                className="mt-6 bg-[#3b82f6] py-3 rounded-xl items-center"
                                                onPress={() => setDailyModalVisible(false)}
                                            >
                                                <Text className="text-white font-bold text-lg">Close</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

            </SafeAreaView >
        </View >
    );
}
