import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, Moon } from 'lucide-react-native';

export const getWeatherInfo = (code: number) => {
    switch (code) {
        case 0:
            return { label: 'Clear Sky', icon: Sun, color: '#f59e0b' }; // amber-500
        case 1:
        case 2:
        case 3:
            return { label: 'Partly Cloudy', icon: Cloud, color: '#9ca3af' }; // gray-400
        case 45:
        case 48:
            return { label: 'Fog', icon: CloudFog, color: '#6b7280' }; // gray-500
        case 51:
        case 53:
        case 55:
            return { label: 'Drizzle', icon: CloudDrizzle, color: '#60a5fa' }; // blue-400
        case 61:
        case 63:
        case 65:
            return { label: 'Rain', icon: CloudRain, color: '#3b82f6' }; // blue-500
        case 71:
        case 73:
        case 75:
            return { label: 'Snow', icon: CloudSnow, color: '#e5e7eb' }; // gray-200
        case 95:
        case 96:
        case 99:
            return { label: 'Thunderstorm', icon: CloudLightning, color: '#8b5cf6' }; // violet-500
        default:
            return { label: 'Unknown', icon: Sun, color: '#f59e0b' };
    }
};
