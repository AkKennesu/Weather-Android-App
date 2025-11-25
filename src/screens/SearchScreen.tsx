import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, MapPin, ArrowLeft } from 'lucide-react-native';
import { useWeather } from '../context/WeatherContext';
import { searchCity, LocationData } from '../api/weather';

export default function SearchScreen() {
    const navigation = useNavigation();
    const { setLocation } = useWeather();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length > 2) {
            setLoading(true);
            try {
                const data = await searchCity(text);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
        }
    };

    const handleSelect = (item: LocationData) => {
        setLocation(item);
        navigation.goBack();
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <View className="flex-row items-center px-4 py-4 space-x-4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <View className="flex-1 flex-row items-center bg-slate-800 rounded-full px-4 py-2">
                    <Search color="gray" size={20} />
                    <TextInput
                        className="flex-1 ml-2 text-white text-base"
                        placeholder="Search city..."
                        placeholderTextColor="#9ca3af"
                        value={query}
                        onChangeText={handleSearch}
                        autoFocus
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="flex-row items-center px-6 py-4 border-b border-slate-800"
                            onPress={() => handleSelect(item)}
                        >
                            <MapPin color="#60a5fa" size={24} />
                            <View className="ml-4">
                                <Text className="text-white text-lg font-bold">{item.name}</Text>
                                <Text className="text-gray-400">
                                    {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
