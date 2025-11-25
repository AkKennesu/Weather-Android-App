import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useWeather } from '../context/WeatherContext';

interface WindyMapProps {
    latitude: number;
    longitude: number;
    interactive?: boolean;
    onPress?: () => void;
}

export const WindyMap = ({ latitude, longitude, interactive = true, onPress }: WindyMapProps) => {
    const { theme } = useWeather();
    const isDark = theme === 'dark';

    // Construct the embed URL
    // We use the embed2.html endpoint which is mobile friendly
    const buildUrl = () => {
        const baseUrl = 'https://embed.windy.com/embed2.html';
        const params = new URLSearchParams({
            lat: latitude.toString(),
            lon: longitude.toString(),
            detailLat: latitude.toString(),
            detailLon: longitude.toString(),
            width: '650', // These are internal embed dimensions, WebView scales it
            height: '450',
            zoom: '5',
            level: 'surface',
            overlay: 'wind', // Default to wind
            product: 'ecmwf',
            menu: '', // Hide menu
            message: 'true', // Show marker
            marker: 'true',
            calendar: 'now',
            pressure: '',
            type: 'map',
            location: 'coordinates',
            detail: '',
            metricWind: 'default',
            metricTemp: 'default',
            radarRange: '-1'
        });
        return `${baseUrl}?${params.toString()}`;
    };

    return (
        <View className={`rounded-3xl overflow-hidden flex-1 border ${isDark ? 'border-white/10' : 'border-slate-200'} bg-black/10 relative`}>
            <WebView
                source={{ uri: buildUrl() }}
                style={{ flex: 1, opacity: 0.99 }} // Opacity fix for Android crash on some devices
                startInLoadingState={true}
                renderLoading={() => (
                    <View className="absolute inset-0 justify-center items-center bg-transparent">
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                )}
                scrollEnabled={interactive}
                pointerEvents={interactive ? 'auto' : 'none'}
            />
            {!interactive && (
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onPress}
                    activeOpacity={0.5}
                />
            )}
        </View>
    );
};
