import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Clock } from 'lucide-react-native';
import { WeatherIcon } from './WeatherIcon';
import { WeatherData } from '../api/weather';

interface HourlyForecastProps {
    weather: WeatherData;
    selectedDate: string | null;
    selectedHour: any;
    hourlyIndices: number[];
    handleHourClick: (index: number, actualIndex: number) => void;
    formatTemp: (temp: number) => number;
    setSelectedHour: (hour: any) => void;
    setSelectedDate: (date: string) => void;
    textColor: string;
    subTextColor: string;
    cardBg: string;
    borderColor: string;
    searchPlaceholder: string;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
    weather,
    selectedDate,
    selectedHour,
    hourlyIndices,
    handleHourClick,
    formatTemp,
    setSelectedHour,
    setSelectedDate,
    textColor,
    subTextColor,
    cardBg,
    borderColor,
    searchPlaceholder
}) => {
    return (
        <View className="mb-6">
            <View className="flex-row items-center px-6 mb-3 justify-between">
                <View className="flex-row items-center">
                    <Clock size={18} color={searchPlaceholder} />
                    <Text className={`${textColor} font-bold ml-2`}>
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
                            className={`items-center justify-center w-16 py-4 mr-3 rounded-3xl ${isSelected ? 'bg-[#3b82f6] border-2 border-white' : `${cardBg} border ${borderColor}`}`}
                        >
                            <Text className={`text-xs mb-2 ${isSelected ? 'text-white font-bold' : subTextColor}`}>{hour}</Text>
                            <WeatherIcon code={code} isDay={isDay} width={32} height={32} />
                            <Text className={`text-sm font-bold mt-2 ${isSelected ? 'text-white' : textColor}`}>
                                {formatTemp(weather.hourly.temperature_2m[actualIndex])}°
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};
