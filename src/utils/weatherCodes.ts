import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, Moon } from 'lucide-react-native';

export const getWeatherInfo = (code: number) => {
    switch (code) {
        case 0:
            return { label: 'Clear Sky', icon: Sun, color: '#f59e0b', gradient: ['#3b82f6', '#0ea5e9', '#38bdf8'] }; // Sunny Blue
        case 1:
        case 2:
        case 3:
            return { label: 'Partly Cloudy', icon: Cloud, color: '#9ca3af', gradient: ['#475569', '#64748b', '#94a3b8'] }; // Cloudy Gray
        case 45:
        case 48:
            return { label: 'Fog', icon: CloudFog, color: '#6b7280', gradient: ['#374151', '#4b5563', '#6b7280'] }; // Foggy
        case 51:
        case 53:
        case 55:
            return { label: 'Drizzle', icon: CloudDrizzle, color: '#60a5fa', gradient: ['#1e3a8a', '#2563eb', '#60a5fa'] }; // Drizzle Blue
        case 61:
        case 63:
        case 65:
            return { label: 'Rain', icon: CloudRain, color: '#3b82f6', gradient: ['#172554', '#1e40af', '#3b82f6'] }; // Rain Dark Blue
        case 71:
        case 73:
        case 75:
            return { label: 'Snow', icon: CloudSnow, color: '#e5e7eb', gradient: ['#1e293b', '#334155', '#94a3b8'] }; // Snowy
        case 95:
        case 96:
        case 99:
            return { label: 'Thunderstorm', icon: CloudLightning, color: '#8b5cf6', gradient: ['#312e81', '#4c1d95', '#7c3aed'] }; // Storm Purple
        default:
            return { label: 'Unknown', icon: Sun, color: '#f59e0b', gradient: ['#1e1b4b', '#0f172a'] };
    }
};
