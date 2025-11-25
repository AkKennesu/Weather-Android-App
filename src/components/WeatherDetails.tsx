import React from 'react';
import { View, Text } from 'react-native';
import { Wind, Droplets, CloudRain } from 'lucide-react-native';

interface WeatherDetailsProps {
    windSpeed: number;
    humidity: number;
    precipitation: number;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({ windSpeed, humidity, precipitation }) => {
    return (
        <View className="flex-row justify-between mt-6 px-4">
            {/* Wind */}
            <View className="bg-[#1e293b]/50 p-4 rounded-2xl items-center justify-center w-[30%] border border-white/10">
                <View className="bg-white/10 p-2 rounded-full mb-2">
                    <Wind size={20} color="white" />
                </View>
                <Text className="text-gray-400 text-xs mb-1">Wind</Text>
                <Text className="text-white font-bold text-sm">{Math.round(windSpeed)} km/h</Text>
            </View>

            {/* Humidity */}
            <View className="bg-[#1e293b]/50 p-4 rounded-2xl items-center justify-center w-[30%] border border-white/10">
                <View className="bg-white/10 p-2 rounded-full mb-2">
                    <Droplets size={20} color="white" />
                </View>
                <Text className="text-gray-400 text-xs mb-1">Humidity</Text>
                <Text className="text-white font-bold text-sm">{humidity}%</Text>
            </View>

            {/* Precipitation */}
            <View className="bg-[#1e293b]/50 p-4 rounded-2xl items-center justify-center w-[30%] border border-white/10">
                <View className="bg-white/10 p-2 rounded-full mb-2">
                    <CloudRain size={20} color="white" />
                </View>
                <Text className="text-gray-400 text-xs mb-1">Rain</Text>
                <Text className="text-white font-bold text-sm">{precipitation}%</Text>
            </View>
        </View>
    );
};
