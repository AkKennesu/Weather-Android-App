import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Calendar, Sunrise, Sunset, Sun, CloudRain, Clock } from 'lucide-react-native';
import { subDays, format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { useWeather } from '../context/WeatherContext';
import { fetchHistory } from '../api/weather';
import { getWeatherInfo } from '../utils/weatherCodes';
import { WeatherIcon } from '../components/WeatherIcon';

export default function HistoryScreen() {
    const navigation = useNavigation();
    const { location, theme, units } = useWeather();
    const [history, setHistory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Theme Helpers
    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-[#0f172a]' : 'bg-[#f0f9ff]';
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-gray-400' : 'text-slate-500';
    const cardBg = isDark ? 'bg-white/5' : 'bg-white/60';
    const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
    const gradientColors = isDark ? ['#0f172a', '#1e293b'] : ['#f0f9ff', '#e0f2fe'];

    useEffect(() => {
        const loadHistory = async () => {
            if (!location) return;

            const endDate = format(subDays(new Date(), 1), 'yyyy-MM-dd'); // Yesterday
            const startDate = format(subDays(new Date(), 10), 'yyyy-MM-dd'); // 10 days ago

            try {
                const data = await fetchHistory(location.latitude, location.longitude, startDate, endDate);
                setHistory(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [location]);

    const handleItemClick = (item: any) => {
        setSelectedHistoryItem(item);
        setModalVisible(true);
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
                <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#0ea5e9"} />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <LinearGradient
                colors={gradientColors as any}
                className="absolute left-0 right-0 top-0 h-full"
            />
            <SafeAreaView className="flex-1">
                <View className={`flex-row items-center px-4 py-4 space-x-4 border-b ${borderColor}`}>
                    <TouchableOpacity onPress={() => navigation.goBack()} className={isDark ? "bg-white/10 p-2 rounded-full" : "bg-slate-200 p-2 rounded-full"}>
                        <ArrowLeft color={isDark ? "white" : "#0f172a"} size={24} />
                    </TouchableOpacity>
                    <Text className={`${textColor} text-xl font-bold`}>Past 10 Days History</Text>
                </View>

                <View className="p-4">
                    <Text className={`${subTextColor} mb-4`}>
                        Location: <Text className={`${textColor} font-bold`}>{location?.name}</Text>
                    </Text>
                </View>

                <View className="flex-1 px-4">
                    {history && history.daily ? (
                        <FlatList
                            data={history.daily.time.map((t: string, i: number) => ({
                                time: t,
                                max: history.daily.temperature_2m_max[i],
                                min: history.daily.temperature_2m_min[i],
                                code: history.daily.weathercode[i],
                                sunrise: history.daily.sunrise ? history.daily.sunrise[i] : null,
                                sunset: history.daily.sunset ? history.daily.sunset[i] : null,
                                uvIndex: history.daily.uv_index_max ? history.daily.uv_index_max[i] : null,
                                precipSum: history.daily.precipitation_sum ? history.daily.precipitation_sum[i] : null,
                                daylightDuration: history.daily.daylight_duration ? history.daily.daylight_duration[i] : null,
                            })).reverse()}
                            keyExtractor={(item) => item.time}
                            renderItem={({ item }) => {
                                const info = getWeatherInfo(item.code);
                                const Icon = info.icon;
                                return (
                                    <TouchableOpacity
                                        onPress={() => handleItemClick(item)}
                                        className={`flex-row items-center justify-between ${cardBg} p-4 mb-3 rounded-xl border ${borderColor}`}
                                    >
                                        <View>
                                            <Text className={`${textColor} font-bold text-lg`}>
                                                {format(new Date(item.time), 'MMM d, yyyy')}
                                            </Text>
                                            <Text className={subTextColor}>{format(new Date(item.time), 'EEEE')}</Text>
                                        </View>
                                        <View className="flex-row items-center space-x-4">
                                            <View className="items-center">
                                                <Icon size={24} color={info.color} />
                                                <Text className={`${subTextColor} text-xs mt-1`}>{info.label}</Text>
                                            </View>
                                            <View className="items-end w-16">
                                                <Text className={`${textColor} font-bold text-lg`}>{formatTemp(item.max)}°</Text>
                                                <Text className={subTextColor}>{formatTemp(item.min)}°</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={<Text className={`${textColor} text-center mt-10`}>No history data available.</Text>}
                        />
                    ) : (
                        <Text className={`${textColor} text-center mt-10`}>No history data available.</Text>
                    )}
                </View>

                {/* History Details Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View className="flex-1 justify-center items-center bg-black/60">
                            <TouchableWithoutFeedback>
                                <View className={`${isDark ? 'bg-[#1e293b]' : 'bg-white'} m-4 p-6 rounded-3xl w-[85%] border ${borderColor} shadow-2xl`}>
                                    {selectedHistoryItem && (
                                        <>
                                            <View className="items-center mb-6">
                                                <Text className={`${textColor} text-2xl font-bold mb-1`}>
                                                    {format(new Date(selectedHistoryItem.time), 'EEEE, d MMMM')}
                                                </Text>
                                                <Text className={`${subTextColor} text-lg`}>
                                                    {getWeatherInfo(selectedHistoryItem.code).label}
                                                </Text>
                                            </View>

                                            <View className={`flex-row justify-center items-center mb-8 ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} rounded-2xl p-4`}>
                                                <WeatherIcon code={selectedHistoryItem.code} isDay={true} width={80} height={80} />
                                                <View className="ml-6">
                                                    <View className="flex-row items-end">
                                                        <Text className={`${textColor} text-5xl font-bold`}>{formatTemp(selectedHistoryItem.max)}°</Text>
                                                        <Text className={`${subTextColor} text-xl mb-2 ml-2`}>/ {formatTemp(selectedHistoryItem.min)}°</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="flex-row flex-wrap justify-between">
                                                {selectedHistoryItem.sunrise && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <Sunrise size={20} color="#fbbf24" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Sunrise</Text>
                                                            <Text className={`${textColor} font-bold`}>{format(new Date(selectedHistoryItem.sunrise), 'h:mm a')}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedHistoryItem.sunset && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <Sunset size={20} color="#f97316" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Sunset</Text>
                                                            <Text className={`${textColor} font-bold`}>{format(new Date(selectedHistoryItem.sunset), 'h:mm a')}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedHistoryItem.uvIndex !== null && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <Sun size={20} color="#facc15" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Max UV Index</Text>
                                                            <Text className={`${textColor} font-bold`}>{selectedHistoryItem.uvIndex}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedHistoryItem.precipSum !== null && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <CloudRain size={20} color="#60a5fa" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Precipitation</Text>
                                                            <Text className={`${textColor} font-bold`}>{selectedHistoryItem.precipSum} mm</Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {selectedHistoryItem.daylightDuration !== null && (
                                                    <View className={`w-[48%] ${isDark ? 'bg-[#0f172a]' : 'bg-slate-100'} p-3 rounded-xl mb-3 flex-row items-center`}>
                                                        <Clock size={20} color="#e2e8f0" />
                                                        <View className="ml-3">
                                                            <Text className={`${subTextColor} text-xs`}>Daylight</Text>
                                                            <Text className={`${textColor} font-bold`}>{(selectedHistoryItem.daylightDuration / 3600).toFixed(1)} hrs</Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                className="mt-6 bg-[#3b82f6] py-3 rounded-xl items-center"
                                                onPress={() => setModalVisible(false)}
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
            </SafeAreaView>
        </View>
    );
}
