import React from 'react';
import { SvgProps } from 'react-native-svg';

import ClearDay from '../../assets/weather-icons/clear_day.svg';
import ClearNight from '../../assets/weather-icons/clear_night.svg';
import PartlyCloudyDay from '../../assets/weather-icons/partly_cloudy_day.svg';
import PartlyCloudyNight from '../../assets/weather-icons/partly_cloudy_night.svg';
import Cloudy from '../../assets/weather-icons/cloudy.svg';
import Drizzle from '../../assets/weather-icons/drizzle.svg';
import HeavyRain from '../../assets/weather-icons/heavy_rain.svg';

interface WeatherIconProps extends SvgProps {
    code: number;
    isDay?: boolean;
    iconSet?: 'default' | 'monochrome';
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, isDay = true, iconSet = 'default', ...props }) => {
    let Icon = ClearDay;

    // Mapping based on Open-Meteo WMO codes
    switch (code) {
        case 0: // Clear sky
            Icon = isDay ? ClearDay : ClearNight;
            break;
        case 1: // Mainly clear
        case 2: // Partly cloudy
            Icon = isDay ? PartlyCloudyDay : PartlyCloudyNight;
            break;
        case 3: // Overcast
            Icon = Cloudy;
            break;
        case 45: // Fog
        case 48: // Depositing rime fog
            Icon = Cloudy; // Fallback
            break;
        case 51: // Drizzle: Light
        case 53: // Drizzle: Moderate
        case 55: // Drizzle: Dense intensity
        case 56: // Freezing Drizzle: Light
        case 57: // Freezing Drizzle: Dense
            Icon = Drizzle;
            break;
        case 61: // Rain: Slight
        case 63: // Rain: Moderate
        case 65: // Rain: Heavy intensity
        case 66: // Freezing Rain: Light
        case 67: // Freezing Rain: Heavy
            Icon = HeavyRain; // Fallback for Rain
            break;
        case 71: // Snow fall: Slight
        case 73: // Snow fall: Moderate
        case 75: // Snow fall: Heavy intensity
        case 77: // Snow grains
            Icon = HeavyRain; // Fallback for Snow (missing icon)
            break;
        case 80: // Rain showers: Slight
        case 81: // Rain showers: Moderate
        case 82: // Rain showers: Violent
            Icon = HeavyRain;
            break;
        case 85: // Snow showers slight
        case 86: // Snow showers heavy
            Icon = HeavyRain; // Fallback
            break;
        case 95: // Thunderstorm: Slight or moderate
        case 96: // Thunderstorm with slight hail
        case 99: // Thunderstorm with heavy hail
            Icon = HeavyRain; // Fallback for Thunderstorm
            break;
        default:
            Icon = isDay ? ClearDay : ClearNight;
            break;
    }

    // Apply specific props for monochrome mode if needed
    // Note: react-native-svg icons often use internal paths. 
    // If we want monochrome, we might need to rely on the `fill` or `color` prop being passed down and respected by the SVG.
    // Assuming the imported SVGs accept reasonable props.
    const monochromeProps = iconSet === 'monochrome' ? {
        fill: props.color || (isDay ? 'white' : 'white'), // Default to white for monochrome if no color passed
        style: { opacity: 0.9 }
    } : {};

    return <Icon {...props} {...monochromeProps} />;
};
