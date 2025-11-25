import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

// Import available JSON Lottie files
import ClearNight from '../assets/weather-animations/mostly_clear_night.json';
import Cloudy from '../assets/weather-animations/cloudy.json';
import Rain from '../assets/weather-animations/rain_foreground.json';
import Snow from '../assets/weather-animations/snow_shower_foreground.json';
import Sunny from '../assets/weather-animations/sunny_background.json';
import Thunder from '../assets/weather-animations/thunder_background.json';
import Showers from '../assets/weather-animations/showers.json';
import Flurries from '../assets/weather-animations/flurries_foreground.json';
import Haze from '../assets/weather-animations/haze_foreground.json';

const { width, height } = Dimensions.get('window');

interface WeatherBackgroundProps {
    code: number;
    isDay: boolean;
    style?: ViewStyle;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ code, isDay, style }) => {
    const animationRef = useRef<LottieView>(null);

    useEffect(() => {
        if (animationRef.current) {
            animationRef.current.play();
        }
    }, [code, isDay]);

    let source: any = Cloudy; // Default fallback

    // Mapping based on Open-Meteo WMO codes and available assets
    switch (code) {
        case 0: // Clear sky
            source = isDay ? Sunny : ClearNight;
            break;
        case 1: // Mainly clear
        case 2: // Partly cloudy
            source = isDay ? Sunny : ClearNight;
            break;
        case 3: // Overcast
            source = Cloudy;
            break;
        case 45: // Fog
        case 48: // Depositing rime fog
            source = Haze;
            break;
        case 51: // Drizzle: Light
        case 53: // Drizzle: Moderate
        case 55: // Drizzle: Dense
            source = Showers;
            break;
        case 61: // Rain: Slight
        case 63: // Rain: Moderate
        case 65: // Rain: Heavy
        case 80: // Rain showers: Slight
        case 81: // Rain showers: Moderate
        case 82: // Rain showers: Violent
            source = Rain;
            break;
        case 71: // Snow fall: Slight
        case 73: // Snow fall: Moderate
        case 75: // Snow fall: Heavy
        case 85: // Snow showers: Slight
        case 86: // Snow showers: Heavy
            source = Snow;
            break;
        case 77: // Snow grains
            source = Flurries;
            break;
        case 95: // Thunderstorm: Slight or moderate
        case 96: // Thunderstorm with slight hail
        case 99: // Thunderstorm with heavy hail
            source = Thunder;
            break;
        default:
            source = Cloudy;
            break;
    }

    return (
        <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
            <LottieView
                ref={animationRef}
                source={source}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                autoPlay
                loop
            />
            {/* Overlay to ensure text readability */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
        </View>
    );
};
