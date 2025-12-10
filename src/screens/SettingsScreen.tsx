import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Trash2, Layout, Info, Thermometer, Wind, Moon, Calendar, Activity, Sun } from 'lucide-react-native';
import { useWeather } from '../context/WeatherContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const {
        units,
        setUnits,
        savedLocations,
        removeSavedLocation,
        layoutPreferences,
        toggleLayoutSection,
        theme,
        toggleTheme,
        enabledActivities,
        toggleActivity
    } = useWeather();

    const allActivities = ['Running', 'Cycling', 'Gardening', 'Tennis', 'Badminton', 'Golf', 'Hiking', 'Camping'];

    const isDark = theme === 'dark';
    const bgColor = isDark ? 'bg-[#0f172a]' : 'bg-[#f0f9ff]';
    const cardColor = isDark ? 'bg-[#1e293b]' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-gray-400' : 'text-slate-500';
    const borderColor = isDark ? 'border-white/5' : 'border-slate-200';
    const iconBgColor = isDark ? 'bg-white/10' : 'bg-slate-200';

    const confirmDeleteLocation = (id: number, name: string) => {
        Alert.alert(
            "Remove Location",
            `Are you sure you want to remove ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => removeSavedLocation(id) }
            ]
        );
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className={`flex-row items-center px-4 py-4 border-b ${borderColor}`}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className={`${iconBgColor} p-2 rounded-full mr-4`}
                    >
                        <ArrowLeft color={isDark ? "white" : "#0f172a"} size={24} />
                    </TouchableOpacity>
                    <Text className={`${textColor} text-xl font-bold`}>Settings</Text>
                </View>

                <ScrollView className="flex-1 px-4 py-6">
                    {/* Preferences Section */}
                    <View className="mb-8">
                        <Text className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-xs">Preferences</Text>
                        <View className={`${cardColor} rounded-3xl overflow-hidden border ${borderColor}`}>
                            {/* Theme Toggle */}
                            <View className={`flex-row items-center justify-between p-4 border-b ${borderColor}`}>
                                <View className="flex-row items-center">
                                    <View className="bg-yellow-500/20 p-2 rounded-full mr-3">
                                        {isDark ? <Moon size={20} color="#facc15" /> : <Sun size={20} color="#facc15" />}
                                    </View>
                                    <Text className={`${textColor} font-medium text-base`}>Dark Mode</Text>
                                </View>
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                                    thumbColor={'#ffffff'}
                                />
                            </View>

                            {/* Units Toggle */}
                            <View className={`flex-row items-center justify-between p-4`}>
                                <View className="flex-row items-center">
                                    <View className="bg-blue-500/20 p-2 rounded-full mr-3">
                                        <Thermometer size={20} color="#60a5fa" />
                                    </View>
                                    <Text className={`${textColor} font-medium text-base`}>Temperature Unit</Text>
                                </View>
                                <View className={`flex-row ${isDark ? 'bg-black/20' : 'bg-slate-100'} rounded-lg p-1`}>
                                    <TouchableOpacity
                                        onPress={() => setUnits('celsius')}
                                        className={`px-3 py-1 rounded-md ${units === 'celsius' ? 'bg-blue-500' : 'bg-transparent'}`}
                                    >
                                        <Text className={`font-bold ${units === 'celsius' ? 'text-white' : subTextColor}`}>°C</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setUnits('fahrenheit')}
                                        className={`px-3 py-1 rounded-md ${units === 'fahrenheit' ? 'bg-blue-500' : 'bg-transparent'}`}
                                    >
                                        <Text className={`font-bold ${units === 'fahrenheit' ? 'text-white' : subTextColor}`}>°F</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Layout Customization */}
                    {/* Layout Customization */}
                    <View className="mb-8">
                        <Text className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-xs">Home Screen Layout</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Reorder' as any)}
                            className={`${cardColor} rounded-3xl p-4 border ${borderColor} flex-row items-center justify-between`}
                        >
                            <View className="flex-row items-center">
                                <View className="bg-indigo-500/20 p-2 rounded-full mr-3">
                                    <Layout size={20} color="#818cf8" />
                                </View>
                                <View>
                                    <Text className={`${textColor} font-medium text-base`}>Customize & Reorder</Text>
                                    <Text className={`${subTextColor} text-xs`}>Drag to arrange content</Text>
                                </View>
                            </View>
                            <ArrowLeft size={16} color={isDark ? '#94a3b8' : '#64748b'} style={{ transform: [{ rotate: '180deg' }] }} />
                        </TouchableOpacity>
                    </View>

                    {/* Activities Customization */}
                    <View className="mb-8">
                        <Text className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-xs">Activities</Text>
                        <View className={`${cardColor} rounded-3xl overflow-hidden border ${borderColor}`}>
                            {allActivities.map((activity, index) => (
                                <View key={activity} className={`flex-row items-center justify-between p-4 ${index !== allActivities.length - 1 ? `border-b ${borderColor}` : ''}`}>
                                    <View className="flex-row items-center">
                                        <Text className={`${textColor} font-medium text-base`}>{activity}</Text>
                                    </View>
                                    <Switch
                                        value={enabledActivities.includes(activity)}
                                        onValueChange={() => toggleActivity(activity)}
                                        trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                                        thumbColor={'#ffffff'}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Saved Locations */}
                    <View className="mb-8">
                        <Text className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-xs">Saved Locations</Text>
                        <View className={`${cardColor} rounded-3xl overflow-hidden border ${borderColor}`}>
                            {savedLocations.length > 0 ? (
                                savedLocations.map((loc, index) => (
                                    <View key={loc.id} className={`flex-row items-center justify-between p-4 ${index !== savedLocations.length - 1 ? `border-b ${borderColor}` : ''}`}>
                                        <View className="flex-row items-center flex-1">
                                            <MapPin size={20} color="#94a3b8" />
                                            <View className="ml-3">
                                                <Text className={`${textColor} font-medium text-base`}>{loc.name}</Text>
                                                <Text className={`${subTextColor} text-xs`}>{loc.country}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => confirmDeleteLocation(loc.id, loc.name)}
                                            className="bg-red-500/10 p-2 rounded-full"
                                        >
                                            <Trash2 size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <View className="p-6 items-center">
                                    <Text className={`${subTextColor} italic`}>No saved locations yet.</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* About Section */}
                    <View className="mb-10">
                        <Text className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-xs">About</Text>
                        <View className={`${cardColor} rounded-3xl overflow-hidden border ${borderColor} p-4`}>
                            <View className="flex-row items-center mb-2">
                                <Info size={20} color="#94a3b8" />
                                <Text className={`${textColor} font-bold ml-2 text-lg`}>Weather App</Text>
                            </View>
                            <Text className={`${subTextColor} text-sm leading-5`}>
                                Version 1.1.0{'\n'}
                                Built with React Native & Expo.{'\n'}
                                Data provided by Open-Meteo.
                            </Text>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
