import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import { MapPin, Wind, Search, Moon, Sunrise, Sunset, Settings, Eye, Gauge, Thermometer, Map as MapIcon, Sun, CloudRain, Clock } from 'lucide-react-native';
import SunCalc from 'suncalc';

import { useWeather } from '../context/WeatherContext';
import { fetchWeather, fetchAirQuality, searchCity, LocationData } from '../api/weather';
import { getWeatherInfo } from '../utils/weatherCodes';
import { getMoonPhase } from '../utils/moonPhase';
import { getWeatherTip, getActivityAnalysis } from '../utils/activitySuggestions';

import { WeatherDetails } from '../components/WeatherDetails';
import { ActivityCard } from '../components/ActivityCard';
import { WindyMap } from '../components/WindyMap';
import { WeatherHeader } from '../components/WeatherHeader';
import { HourlyForecast } from '../components/HourlyForecast';
import { DailyForecast } from '../components/DailyForecast';
import { WeatherIcon } from '../components/WeatherIcon';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { location, setLocation, weather, setWeather, airQuality, setAirQuality, layoutPreferences, units, theme, enabledActivities, addSavedLocation, removeSavedLocation, savedLocations, layoutOrder } = useWeather();
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
    const [mapModalVisible, setMapModalVisible] = useState(false);

    // Rate Limiting Refs
    const lastFetchTime = useRef<number>(0);
    const lastFetchCoords = useRef<{ lat: number, lon: number } | null>(null);

    // Theme Helpers
    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-[#0f172a]' : 'bg-[#f0f9ff]';
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-gray-200' : 'text-slate-600';
    const cardBg = isDark ? 'bg-[#1e293b]/50' : 'bg-white/60';
    const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
    const gradientColors = isDark ? ['#1e1b4b', '#0f172a'] : ['#dbeafe', '#eff6ff'];
    const searchBg = isDark ? 'bg-[#1e293b]' : 'bg-white';
    const searchPlaceholder = isDark ? '#94a3b8' : '#64748b';

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

            const [weatherData, airQualityData] = await Promise.all([
                fetchWeather(lat, lon),
                fetchAirQuality(lat, lon)
            ]);

            setWeather(weatherData);
            setAirQuality(airQualityData);

            lastFetchTime.current = now;
            lastFetchCoords.current = { lat, lon };

            // Set default selected date to today
            if (weatherData && weatherData.daily && weatherData.daily.time.length > 0) {
                setSelectedDate(weatherData.daily.time[0]);
            }
        } catch (error) {
            // Error handling silently in production or log to service
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [location, setLocation, setWeather, setAirQuality, weather]);

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
                // Error handling
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
            daylightDuration: weather.daily.daylight_duration ? weather.daily.daylight_duration[index] : null,
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
            apparent_temperature: weather.hourly.apparent_temperature ? weather.hourly.apparent_temperature[actualIndex] : null,
            surface_pressure: weather.hourly.surface_pressure ? weather.hourly.surface_pressure[actualIndex] : null,
            visibility: weather.hourly.visibility ? weather.hourly.visibility[actualIndex] : null,
        };

        // Determine is_day based on hour (simple logic)
        const hour = new Date(hourData.time).getHours();
        hourData.is_day = (hour >= 6 && hour < 18) ? 1 : 0;

        setSelectedHour(hourData);
    };

    // Helper to convert Temp based on units
    const formatTemp = (temp: number) => {
        if (units === 'fahrenheit') {
            return Math.round((temp * 9 / 5) + 32);
        }
        return Math.round(temp);
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${bgColor}`}>
                <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#3b82f6"} />
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
            if (time.startsWith(selectedDate)) {
                indices.push(index);
            }
        });
        return indices;
    };

    const hourlyIndices = getHourlyForDate();

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Background Gradient - Always visible */}
            <LinearGradient
                colors={gradientColors as any}
                className="absolute left-0 right-0 top-0 h-full"
            />

            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "#fff" : "#3b82f6"} />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header & Search - Compact Design */}
                    <View className="px-4 pt-2 pb-4 z-50 flex-row items-center space-x-2">
                        <View className={`flex-1 flex-row items-center ${searchBg} rounded-full px-3 py-2 border ${borderColor} shadow-sm mr-4`}>
                            <Search color={searchPlaceholder} size={16} />
                            <TextInput
                                placeholder="Search city..."
                                placeholderTextColor={searchPlaceholder}
                                className={`flex-1 ml-2 ${textColor} text-base py-2`}
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); }}>
                                    <Text className="text-gray-400 text-xs">X</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {/* Settings Button */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            className={`${searchBg} p-2 rounded-full border ${borderColor} shadow-sm`}
                        >
                            <Settings color={searchPlaceholder} size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <View className={`absolute top-16 left-4 right-14 ${searchBg} rounded-2xl p-2 z-50 shadow-lg border ${borderColor}`}>
                            {searchResults.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className={`flex-row items-center p-3 border-b ${borderColor} last:border-0`}
                                    onPress={() => selectLocation(item)}
                                >
                                    <MapPin size={16} color={searchPlaceholder} />
                                    <Text className={`${textColor} ml-2`}>{item.name}, {item.country}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {weather && displayWeather && weatherInfo ? (
                        <>
                            <WeatherHeader
                                location={location}
                                selectedHour={selectedHour}
                                displayWeather={displayWeather}
                                weatherInfo={weatherInfo}
                                weather={weather}
                                savedLocations={savedLocations}
                                addSavedLocation={addSavedLocation}
                                removeSavedLocation={removeSavedLocation}
                                formatTemp={formatTemp}
                                borderColor={borderColor}
                            />

                            {layoutOrder.map((sectionId) => {
                                switch (sectionId) {
                                    case 'weatherDetails':
                                        return layoutPreferences.showWeatherDetails && (
                                            <View key="weatherDetails">
                                                <WeatherDetails
                                                    windSpeed={displayWeather.windspeed}
                                                    humidity={selectedHour ? displayWeather.humidity : weather.hourly.relative_humidity_2m[0]}
                                                    precipitation={selectedHour ? displayWeather.precipitation : weather.hourly.precipitation_probability[0]}
                                                />
                                                {/* Extended Details */}
                                                <View className="flex-row flex-wrap justify-between px-4 mt-4">
                                                    {/* Feels Like */}
                                                    <View className={`w-[31%] ${cardBg} rounded-2xl p-3 items-center mb-3 border ${borderColor}`}>
                                                        <Thermometer size={20} color="#f87171" />
                                                        <Text className={`${subTextColor} text-[10px] mt-1`}>Feels Like</Text>
                                                        <Text className={`${textColor} font-bold text-sm`}>
                                                            {selectedHour && selectedHour.apparent_temperature
                                                                ? `${formatTemp(selectedHour.apparent_temperature)}°`
                                                                : (weather.hourly.apparent_temperature ? `${formatTemp(weather.hourly.apparent_temperature[0])}°` : 'N/A')}
                                                        </Text>
                                                    </View>
                                                    {/* Pressure */}
                                                    <View className={`w-[31%] ${cardBg} rounded-2xl p-3 items-center mb-3 border ${borderColor}`}>
                                                        <Gauge size={20} color="#a78bfa" />
                                                        <Text className={`${subTextColor} text-[10px] mt-1`}>Pressure</Text>
                                                        <Text className={`${textColor} font-bold text-sm`}>
                                                            {selectedHour && selectedHour.surface_pressure
                                                                ? `${Math.round(selectedHour.surface_pressure)} hPa`
                                                                : (weather.hourly.surface_pressure ? `${Math.round(weather.hourly.surface_pressure[0])} hPa` : 'N/A')}
                                                        </Text>
                                                    </View>
                                                    {/* Visibility */}
                                                    <View className={`w-[31%] ${cardBg} rounded-2xl p-3 items-center mb-3 border ${borderColor}`}>
                                                        <Eye size={20} color="#60a5fa" />
                                                        <Text className={`${subTextColor} text-[10px] mt-1`}>Visibility</Text>
                                                        <Text className={`${textColor} font-bold text-sm`}>
                                                            {selectedHour && selectedHour.visibility
                                                                ? `${(selectedHour.visibility / 1000).toFixed(1)} km`
                                                                : (weather.hourly.visibility ? `${(weather.hourly.visibility[0] / 1000).toFixed(1)} km` : 'N/A')}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Air Quality Section */}
                                                {airQuality && (
                                                    <View className="px-4 mb-6 mt-2">
                                                        <View className={`${cardBg} rounded-3xl p-4 border ${borderColor}`}>
                                                            <View className="flex-row items-center mb-3">
                                                                <Wind size={18} color="#34d399" />
                                                                <Text className={`${textColor} font-bold ml-2`}>Air Quality</Text>
                                                            </View>
                                                            <View className="flex-row justify-between">
                                                                <View className="items-center">
                                                                    <Text className={`${subTextColor} text-xs`}>AQI (US)</Text>
                                                                    <Text className={`${textColor} font-bold text-lg`}>{airQuality.current.uv_index}</Text>
                                                                </View>
                                                                <View className="items-center">
                                                                    <Text className={`${subTextColor} text-xs`}>PM2.5</Text>
                                                                    <Text className={`${textColor} font-bold text-lg`}>{airQuality.current.pm2_5}</Text>
                                                                </View>
                                                                <View className="items-center">
                                                                    <Text className={`${subTextColor} text-xs`}>PM10</Text>
                                                                    <Text className={`${textColor} font-bold text-lg`}>{airQuality.current.pm10}</Text>
                                                                </View>
                                                                <View className="items-center">
                                                                    <Text className={`${subTextColor} text-xs`}>Ozone</Text>
                                                                    <Text className={`${textColor} font-bold text-lg`}>{airQuality.current.ozone}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                )}
                                                <View className="mb-6" />
                                            </View>
                                        );

                                    case 'hourlyForecast':
                                        return layoutPreferences.showHourlyForecast && (
                                            <View key="hourlyForecast">
                                                <HourlyForecast
                                                    weather={weather}
                                                    selectedDate={selectedDate}
                                                    selectedHour={selectedHour}
                                                    hourlyIndices={hourlyIndices}
                                                    handleHourClick={handleHourClick}
                                                    formatTemp={formatTemp}
                                                    setSelectedHour={setSelectedHour}
                                                    setSelectedDate={setSelectedDate}
                                                    textColor={textColor}
                                                    subTextColor={subTextColor}
                                                    cardBg={cardBg}
                                                    borderColor={borderColor}
                                                    searchPlaceholder={searchPlaceholder}
                                                />
                                            </View>
                                        );

                                    case 'activities':
                                        return layoutPreferences.showActivities && (
                                            <View key="activities" className="mb-6">
                                                <View className="flex-row items-center px-6 mb-3">
                                                    <Text className={`${textColor} font-bold text-lg`}>Activities</Text>
                                                </View>
                                                <ScrollView
                                                    horizontal
                                                    showsHorizontalScrollIndicator={false}
                                                    contentContainerStyle={{ paddingHorizontal: 16 }}
                                                    snapToInterval={Dimensions.get('window').width - 16}
                                                    decelerationRate="fast"
                                                    snapToAlignment="center"
                                                >
                                                    {getActivityAnalysis(weather)
                                                        .filter(activity => enabledActivities.includes(activity.activity))
                                                        .map((activity, index) => (
                                                            <ActivityCard key={index} data={activity} />
                                                        ))}
                                                </ScrollView>
                                            </View>
                                        );

                                    case 'moonPhase':
                                        return layoutPreferences.showMoonPhase && (
                                            <View key="moonPhase" className="px-4 mb-6">
                                                <View className={`${cardBg} rounded-3xl p-5 border ${borderColor}`}>
                                                    <View className="flex-row items-center justify-between mb-4">
                                                        <View>
                                                            <View className="flex-row items-center mb-2">
                                                                <Moon size={18} color={searchPlaceholder} />
                                                                <Text className={`${textColor} font-bold ml-2`}>Moon Phase</Text>
                                                            </View>
                                                            <Text className={`${textColor} text-lg font-medium`}>{getMoonPhase(new Date()).label}</Text>
                                                            <Text className={`${subTextColor} text-sm`}>Illumination: {Math.round(getMoonPhase(new Date()).fraction * 100)}%</Text>
                                                        </View>
                                                        <View>
                                                            {(() => {
                                                                const PhaseIcon = getMoonPhase(new Date()).icon;
                                                                return <PhaseIcon size={40} color={isDark ? "#e2e8f0" : "#475569"} />;
                                                            })()}
                                                        </View>
                                                    </View>

                                                    <View className={`flex-row justify-between pt-4 border-t ${borderColor}`}>
                                                        <View className="flex-row items-center">
                                                            <Sunrise size={16} color="#fbbf24" />
                                                            <View className="ml-2">
                                                                <Text className={`${subTextColor} text-xs`}>Moonrise</Text>
                                                                <Text className={`${textColor} font-medium`}>
                                                                    {(() => {
                                                                        if (!location) return 'N/A';
                                                                        const times = SunCalc.getMoonTimes(new Date(), location.latitude, location.longitude);
                                                                        return times.rise ? format(times.rise, 'h:mm a') : 'N/A';
                                                                    })()}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View className="flex-row items-center">
                                                            <Sunset size={16} color="#f97316" />
                                                            <View className="ml-2">
                                                                <Text className={`${subTextColor} text-xs`}>Moonset</Text>
                                                                <Text className={`${textColor} font-medium`}>
                                                                    {(() => {
                                                                        if (!location) return 'N/A';
                                                                        const times = SunCalc.getMoonTimes(new Date(), location.latitude, location.longitude);
                                                                        return times.set ? format(times.set, 'h:mm a') : 'N/A';
                                                                    })()}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        );

                                    case 'dailyForecast':
                                        return layoutPreferences.showDailyForecast && (
                                            <View key="dailyForecast">
                                                <DailyForecast
                                                    weather={weather}
                                                    selectedDate={selectedDate}
                                                    handleDayClick={handleDayClick}
                                                    formatTemp={formatTemp}
                                                    textColor={textColor}
                                                    subTextColor={subTextColor}
                                                    cardBg={cardBg}
                                                    borderColor={borderColor}
                                                    searchPlaceholder={searchPlaceholder}
                                                    isDark={isDark}
                                                />
                                            </View>
                                        );

                                    case 'weatherMap':
                                        return layoutPreferences.showWeatherMap && location && (
                                            <View key="weatherMap" className="px-4 mb-20">
                                                <View className="flex-row items-center mb-4 px-2">
                                                    <MapIcon size={20} color={searchPlaceholder} />
                                                    <Text className={`${textColor} font-bold ml-2 text-lg`}>Weather Map</Text>
                                                </View>
                                                <View className="h-[300px]">
                                                    <WindyMap
                                                        latitude={location.latitude}
                                                        longitude={location.longitude}
                                                        interactive={false}
                                                        onPress={() => setMapModalVisible(true)}
                                                    />
                                                </View>
                                            </View>
                                        );
                                }
                            })}

                            {/* Weather Tip - Keep outside of reorder for now, or add to 'weatherDetails' or a new section? 
                                Actually, in original code it was between Hourly and Activities. 
                                Let's put it fixed at the bottom of the list or attach to weatherDetails?
                                Original: WeatherDetails -> Hourly -> Tip -> Activities.
                                Let's attach it to 'hourlyForecast' or 'weatherDetails' to keep it somewhere logic.
                                Or just hardcode it after the loop? 
                                Let's hardcode it after header? No, it's a "Tip".
                                I'll add a new section 'weatherTip' to layoutOrder implicitly or just render it if specific condition met.
                                For now, I'll render it AFTER the loop if I missed it, OR I can add it to 'weatherDetails' block.
                                In the previous code, it was lines 405-414.
                                I'll put it in 'weatherDetails' for now, or better, 'hourlyForecast' case since it's usually near there?
                                Actually, I'll just append it to 'weatherDetails' so it appears with current info.
                            */}
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
                        <MapIcon color="white" size={24} />
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
                                <View className={`${isDark ? 'bg-[#1e293b]' : 'bg-white'} m-4 p-6 rounded-3xl w-[85%] border ${borderColor} shadow-2xl`}>
                                    {selectedDailyDetails && (
                                        <>
                                            <View className="items-center mb-6">
                                                <Text className={`${textColor} text-2xl font-bold mb-1`}>
                                                    {format(new Date(selectedDailyDetails.date), 'EEEE, d MMMM')}
                                                </Text>
                                                <Text className={`${subTextColor} text-lg`}>
                                                    {getWeatherInfo(selectedDailyDetails.weathercode).label}
                                                </Text>
                                            </View>

                                            <View className={`flex-row justify-center items-center mb-8 ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} rounded-2xl p-4`}>
                                                <WeatherIcon code={selectedDailyDetails.weathercode} isDay={true} width={80} height={80} />
                                                <View className="ml-6">
                                                    <View className="flex-row items-end">
                                                        <Text className={`${textColor} text-5xl font-bold`}>{formatTemp(selectedDailyDetails.maxTemp)}°</Text>
                                                        <Text className={`${subTextColor} text-xl mb-2 ml-2`}>/ {formatTemp(selectedDailyDetails.minTemp)}°</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="flex-row flex-wrap justify-between">
                                                {selectedDailyDetails.sunrise && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <Sunrise size={20} color="#fbbf24" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Sunrise</Text>
                                                            <Text className={`${textColor} font-bold`}>{format(new Date(selectedDailyDetails.sunrise), 'h:mm a')}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedDailyDetails.sunset && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <Sunset size={20} color="#f97316" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Sunset</Text>
                                                            <Text className={`${textColor} font-bold`}>{format(new Date(selectedDailyDetails.sunset), 'h:mm a')}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedDailyDetails.uvIndex !== null && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <Sun size={20} color="#facc15" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Max UV Index</Text>
                                                            <Text className={`${textColor} font-bold`}>{selectedDailyDetails.uvIndex}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedDailyDetails.precipProb !== null && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <CloudRain size={20} color="#60a5fa" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Rain Chance</Text>
                                                            <Text className={`${textColor} font-bold`}>{selectedDailyDetails.precipProb}%</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedDailyDetails.daylightDuration !== null && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <Clock size={20} color="#e2e8f0" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Daylight</Text>
                                                            <Text className={`${textColor} font-bold`}>{(selectedDailyDetails.daylightDuration / 3600).toFixed(1)} hrs</Text>
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

                {/* Full Screen Map Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={mapModalVisible}
                    onRequestClose={() => setMapModalVisible(false)}
                >
                    <SafeAreaView className={`flex-1 ${bgColor}`}>
                        <View className="flex-1 relative">
                            {location && (
                                <WindyMap
                                    latitude={location.latitude}
                                    longitude={location.longitude}
                                    interactive={true}
                                />
                            )}

                            {/* Close Button */}
                            <TouchableOpacity
                                onPress={() => setMapModalVisible(false)}
                                className="absolute top-4 right-4 bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 shadow-lg"
                            >
                                <Text className="text-white font-bold">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Modal>

            </SafeAreaView >
        </View >
    );
}
