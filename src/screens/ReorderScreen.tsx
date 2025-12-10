import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, GripVertical, Wind, Calendar, Activity, Moon, Map as MapIcon, Info, Gauge } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWeather, LayoutSectionId } from '../context/WeatherContext';

export default function ReorderScreen() {
    const navigation = useNavigation();
    const { layoutOrder, updateLayoutOrder, theme, layoutPreferences, toggleLayoutSection } = useWeather();
    const isDark = theme === 'dark';

    // UI Theme Constants
    const bgColor = isDark ? 'bg-[#0f172a]' : 'bg-[#f0f9ff]';
    const cardColor = isDark ? 'bg-[#1e293b]' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-gray-400' : 'text-slate-500';
    const borderColor = isDark ? 'border-white/5' : 'border-slate-200';
    const iconBgColor = isDark ? 'bg-white/10' : 'bg-slate-200';

    const renderItem = ({ item, drag, isActive }: RenderItemParams<LayoutSectionId>) => {
        let label = '';
        let icon = <Info size={24} color={isDark ? '#fff' : '#000'} />;
        let isEnabled = true;
        let toggleKey: keyof typeof layoutPreferences | null = null;

        switch (item) {
            case 'weatherDetails':
                label = 'Current Weather Details';
                icon = <Gauge size={24} color="#60a5fa" />;
                isEnabled = layoutPreferences.showWeatherDetails;
                toggleKey = 'showWeatherDetails';
                break;
            case 'hourlyForecast':
                label = 'Hourly Forecast';
                icon = <Calendar size={24} color="#fb923c" />;
                isEnabled = layoutPreferences.showHourlyForecast;
                toggleKey = 'showHourlyForecast';
                break;
            case 'activities':
                label = 'Activities';
                icon = <Activity size={24} color="#4ade80" />;
                isEnabled = layoutPreferences.showActivities;
                toggleKey = 'showActivities';
                break;
            case 'moonPhase':
                label = 'Moon Phase';
                icon = <Moon size={24} color="#facc15" />;
                isEnabled = layoutPreferences.showMoonPhase;
                toggleKey = 'showMoonPhase';
                break;
            case 'dailyForecast':
                label = 'Daily Forecast';
                icon = <Calendar size={24} color="#818cf8" />;
                isEnabled = layoutPreferences.showDailyForecast;
                toggleKey = 'showDailyForecast';
                break;
            case 'weatherMap':
                label = 'Weather Map';
                icon = <MapIcon size={24} color="#60a5fa" />;
                isEnabled = layoutPreferences.showWeatherMap;
                toggleKey = 'showWeatherMap';
                break;
        }

        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${borderColor} ${isActive ? 'bg-blue-500/20 border-blue-500' : cardColor}`}
                >
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPressIn={drag} className="mr-4 p-2">
                            <GripVertical size={24} color={isDark ? '#94a3b8' : '#cbd5e1'} />
                        </TouchableOpacity>

                        <View className={`p-2 rounded-full mr-3 ${iconBgColor}`}>
                            {icon}
                        </View>

                        <View>
                            <Text className={`${textColor} font-bold text-base`}>{label}</Text>
                            <Text className={`${subTextColor} text-xs`}>Long press to reorder</Text>
                        </View>
                    </View>

                    {toggleKey && (
                        <Switch
                            value={isEnabled}
                            onValueChange={() => toggleLayoutSection(toggleKey!)}
                            trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                            thumbColor={'#ffffff'}
                        />
                    )}
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            <SafeAreaView className="flex-1">
                <View className={`flex-row items-center px-4 py-4 border-b ${borderColor} mb-2`}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className={`${iconBgColor} p-2 rounded-full mr-4`}
                    >
                        <ArrowLeft color={isDark ? "white" : "#0f172a"} size={24} />
                    </TouchableOpacity>
                    <Text className={`${textColor} text-xl font-bold`}>Customize Layout</Text>
                </View>

                <View className="flex-1 px-4">
                    <DraggableFlatList
                        data={layoutOrder}
                        onDragEnd={({ data }) => updateLayoutOrder(data)}
                        keyExtractor={(item) => item}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}
