import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { ActivityStatus } from '../utils/activitySuggestions';
import { format } from 'date-fns';
import { Smile, Frown, Bike, Sprout, Footprints, Tent, Mountain, Flag, Trophy } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Map activity names to icons
const getActivityIcon = (activity: string) => {
    switch (activity) {
        case 'Running': return <Footprints size={40} color="white" />;
        case 'Cycling': return <Bike size={40} color="white" />;
        case 'Gardening': return <Sprout size={40} color="white" />;
        case 'Tennis':
        case 'Badminton': return <Trophy size={40} color="white" />;
        case 'Golf': return <Flag size={40} color="white" />;
        case 'Hiking': return <Mountain size={40} color="white" />;
        case 'Camping': return <Tent size={40} color="white" />;
        default: return <Smile size={40} color="white" />;
    }
};

interface ActivityCardProps {
    data: ActivityStatus;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ data }) => {
    const isGood = data.status === 'Good';

    return (
        <View
            className="bg-[#1e293b] rounded-3xl p-5 border border-white/5 mr-4"
            style={{ width: width - 32 }}
        >
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-white text-lg font-bold mb-2">{data.activity}</Text>
                    {getActivityIcon(data.activity)}
                </View>

                <View className="flex-row space-x-4">
                    {data.hourlyForecast.map((hour, index) => (
                        <View key={index} className="items-center">
                            <Text className="text-gray-400 text-xs mb-1">{format(new Date(hour.time), 'h a')}</Text>
                            {hour.status === 'Good' ? (
                                <View className="bg-green-500/20 p-1.5 rounded-full">
                                    <Smile size={20} color="#4ade80" />
                                </View>
                            ) : (
                                <View className="bg-red-500/20 p-1.5 rounded-full">
                                    <Frown size={20} color="#f87171" />
                                </View>
                            )}
                            <Text className={`text-[10px] mt-1 font-medium ${hour.status === 'Good' ? 'text-green-400' : 'text-red-400'}`}>
                                {hour.status}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View>
                <Text className={`text-2xl font-bold mb-1 ${isGood ? 'text-white' : 'text-white'}`}>
                    {data.status}
                </Text>
                <Text className="text-gray-400 text-sm leading-5">
                    {data.description}
                </Text>
            </View>
        </View>
    );
};
