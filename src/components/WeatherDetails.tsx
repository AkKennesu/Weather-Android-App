import React from 'react';
import { View, Text } from 'react-native';
import { Wind, Droplets, CloudRain } from 'lucide-react-native';

interface WeatherDetailsProps {
    windSpeed: number;
    humidity: number;
    precipitation: number;
    cardBg?: string;
    borderColor?: string;
    textColor?: string;
    subTextColor?: string;
    iconColor?: string;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({
    windSpeed,
    humidity,
    precipitation,
    cardBg = "bg-white/20",
    borderColor = "border-white/20",
    textColor = "text-white",
    subTextColor = "text-gray-200",
    iconColor = "white"
}) => {
    return (
        <View className="flex-row justify-between mb-2 mt-4 px-4">
            {/* Wind */}
            <View className={`${cardBg} p-4 rounded-2xl items-center justify-center w-[30%] border ${borderColor} shadow-sm`}>
                <View className="bg-white/20 p-2 rounded-full mb-2">
                    <Wind size={20} color={iconColor} />
                </View>
                <Text className={`${subTextColor} text-xs mb-1 font-medium`}>Wind</Text>
                <Text className={`${textColor} font-bold text-sm`}>{Math.round(windSpeed)} km/h</Text>
            </View>

            {/* Humidity */}
            <View className={`${cardBg} p-4 rounded-2xl items-center justify-center w-[30%] border ${borderColor} shadow-sm`}>
                <View className="bg-white/20 p-2 rounded-full mb-2">
                    <Droplets size={20} color={iconColor} />
                </View>
                <Text className={`${subTextColor} text-xs mb-1 font-medium`}>Humidity</Text>
                <Text className={`${textColor} font-bold text-sm`}>{humidity}%</Text>
            </View>

            {/* Precipitation */}
            <View className={`${cardBg} p-4 rounded-2xl items-center justify-center w-[30%] border ${borderColor} shadow-sm`}>
                <View className="bg-white/20 p-2 rounded-full mb-2">
                    <CloudRain size={20} color={iconColor} />
                </View>
                <Text className={`${subTextColor} text-xs mb-1 font-medium`}>Rain</Text>
                <Text className={`${textColor} font-bold text-sm`}>{precipitation}%</Text>
            </View>
        </View>
    );
};
