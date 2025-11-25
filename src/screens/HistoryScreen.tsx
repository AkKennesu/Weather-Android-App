import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { subDays, format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { useWeather } from '../context/WeatherContext';
import { fetchHistory } from '../api/weather';
import { getWeatherInfo } from '../utils/weatherCodes';

export default function HistoryScreen() {
    const navigation = useNavigation();
    const { location } = useWeather();
    const [history, setHistory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <View className="flex-1 bg-slate-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b']}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                <View className="flex-row items-center px-4 py-4 space-x-4 border-b border-white/10">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Past 10 Days History</Text>
                </View>

                <View className="p-4">
                    <Text className="text-gray-400 mb-4">
                        Location: <Text className="text-white font-bold">{location?.name}</Text>
                    </Text>
                </View>

                <View className="flex-1 px-4">
                    {history && history.daily ? (
                        <FlatList
                            data={history.daily.time.map((t: string, i: number) => ({
                                time: t,
                                max: history.daily.temperature_2m_max[i],
                                min: history.daily.temperature_2m_min[i],
                                code: history.daily.weathercode[i]
                            })).reverse()}
                            keyExtractor={(item) => item.time}
                            renderItem={({ item }) => {
                                const info = getWeatherInfo(item.code);
                                const Icon = info.icon;
                                return (
                                    <View className="flex-row items-center justify-between bg-white/5 p-4 mb-3 rounded-xl">
                                        <View>
                                            <Text className="text-white font-bold text-lg">
                                                {format(new Date(item.time), 'MMM d, yyyy')}
                                            </Text>
                                            <Text className="text-gray-400">{format(new Date(item.time), 'EEEE')}</Text>
                                        </View>
                                        <View className="flex-row items-center space-x-4">
                                            <View className="items-center">
                                                <Icon size={24} color={info.color} />
                                                <Text className="text-gray-400 text-xs mt-1">{info.label}</Text>
                                            </View>
                                            <View className="items-end w-16">
                                                <Text className="text-white font-bold text-lg">{Math.round(item.max)}°</Text>
                                                <Text className="text-gray-400">{Math.round(item.min)}°</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            }}
                            ListEmptyComponent={<Text className="text-white text-center mt-10">No history data available.</Text>}
                        />
                    ) : (
                        <Text className="text-white text-center mt-10">No history data available.</Text>
                    )}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}
