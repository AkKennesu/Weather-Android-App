import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react-native';
import { WeatherIcon } from './WeatherIcon';
import { WeatherData } from '../api/weather';
import { getWeatherInfo } from '../utils/weatherCodes';

interface DailyForecastProps {
    weather: WeatherData;
    selectedDate: string | null;
    handleDayClick: (index: number) => void;
    formatTemp: (temp: number) => number;
    textColor: string;
    subTextColor: string;
    cardBg: string;
    borderColor: string;
    searchPlaceholder: string;
    isDark: boolean;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({
    weather,
    selectedDate,
    handleDayClick,
    formatTemp,
    textColor,
    subTextColor,
    cardBg,
    borderColor,
    searchPlaceholder,
    isDark
}) => {
    return (
        <View className="px-4 mb-6">
            <View className="flex-row items-center mb-4 px-2">
                <Calendar size={20} color={searchPlaceholder} />
                <Text className={`${textColor} font-bold ml-2 text-lg`}>Next 7 Days</Text>
            </View>
            <View className={`${cardBg} rounded-3xl p-4 border ${borderColor}`}>
                {weather.daily.time.map((date, index) => {
                    const code = weather.daily.weathercode[index];
                    const info = getWeatherInfo(code);
                    const isToday = index === 0;
                    const isSelected = selectedDate === date;

                    return (
                        <TouchableOpacity
                            key={date}
                            onPress={() => handleDayClick(index)}
                            className={`flex-row justify-between items-center py-5 border-b ${borderColor} last:border-0 ${isSelected ? (isDark ? 'bg-white/10' : 'bg-blue-50') + ' -mx-4 px-4' : ''}`}
                        >
                            <Text className={`font-medium w-24 text-base ${isSelected ? 'text-blue-400 font-bold' : textColor}`}>
                                {isToday ? 'Today' : format(new Date(date), 'EEEE')}
                            </Text>
                            <View className="flex-row items-center flex-1 justify-center">
                                <View className="flex-col items-center">
                                    <WeatherIcon code={code} isDay={true} width={40} height={40} />
                                    <Text className={`text-[10px] ${subTextColor} mt-1 font-medium`}>{info.label}</Text>
                                </View>
                            </View>
                            <View className="flex-row w-24 justify-end items-center space-x-4">
                                <Text className={`${textColor} font-bold text-lg`}>
                                    {formatTemp(weather.daily.temperature_2m_max[index])}°
                                </Text>
                                <Text className={`${subTextColor} text-lg`}>
                                    {formatTemp(weather.daily.temperature_2m_min[index])}°
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
