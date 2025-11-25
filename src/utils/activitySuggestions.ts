import { WeatherData } from '../api/weather';

export interface ActivityStatus {
    activity: string;
    status: 'Good' | 'Poor';
    description: string;
    hourlyForecast: {
        time: string;
        status: 'Good' | 'Poor';
    }[];
}

export const getWeatherTip = (currentWeather: any): string => {
    const { weathercode, temperature, windspeed } = currentWeather;

    // Rain/Snow
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weathercode)) return "Don't forget your umbrella! ☔";
    if ([71, 73, 75, 85, 86].includes(weathercode)) return "Bundle up, it's snowing! ❄️";
    if (weathercode >= 95) return "Stay safe, storm approaching! ⚡";

    // Temperature
    if (temperature > 30) return "Stay hydrated, it's hot out there! 💧";
    if (temperature < 5) return "Wear a warm coat today! 🧥";
    if (temperature < 15) return "A light jacket might be needed. 🧣";

    // Wind
    if (windspeed > 20) return "It's quite windy, hold onto your hat! 💨";

    // Clear/Nice
    if (weathercode <= 3) return "Enjoy the beautiful sunshine! ☀️";

    return "Have a wonderful day! 😊";
};

const isGoodForActivity = (activity: string, temp: number, rainProb: number, wind: number, weatherCode: number): boolean => {
    const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
    const isSnowing = [71, 73, 75, 85, 86].includes(weatherCode);

    if (isRaining || isSnowing) return false;

    switch (activity) {
        case 'Running':
            // Ideal: 5-25°C, Low Wind
            return temp >= 5 && temp <= 25 && wind < 25;
        case 'Cycling':
            // Ideal: 10-30°C, Low Wind
            return temp >= 10 && temp <= 30 && wind < 20;
        case 'Gardening':
            // Ideal: 10-30°C, Not too windy
            return temp >= 10 && temp <= 30 && wind < 30;
        default:
            return true;
    }
};

export const getActivityAnalysis = (weather: WeatherData): ActivityStatus[] => {
    const activities = ['Running', 'Cycling', 'Gardening'];
    const currentHourIndex = new Date().getHours(); // Approximate index for current hour

    // Get next 3 hours (including current)
    const nextHours = weather.hourly.time.slice(currentHourIndex, currentHourIndex + 3).map((t, i) => {
        const idx = currentHourIndex + i;
        return {
            time: t,
            temp: weather.hourly.temperature_2m[idx],
            rainProb: weather.hourly.precipitation_probability[idx],
            wind: weather.hourly.wind_speed_10m[idx],
            code: weather.hourly.weathercode[idx]
        };
    });

    return activities.map(activity => {
        // Analyze current condition
        const current = nextHours[0];
        const isGoodNow = isGoodForActivity(activity, current.temp, current.rainProb, current.wind, current.code);

        // Analyze next 3 hours for the mini-forecast
        const hourlyForecast = nextHours.map(h => ({
            time: h.time,
            status: isGoodForActivity(activity, h.temp, h.rainProb, h.wind, h.code) ? 'Good' as const : 'Poor' as const
        }));

        // Determine overall description
        let description = "";
        if (isGoodNow) {
            description = `Great conditions for ${activity.toLowerCase()} right now.`;
        } else {
            // Why is it poor?
            if (current.rainProb > 50 || [51, 53, 55, 61, 63, 65].includes(current.code)) description = `Rain expected, maybe skip ${activity.toLowerCase()}.`;
            else if (current.temp > 30) description = `Too hot for ${activity.toLowerCase()} right now.`;
            else if (current.temp < 5) description = `Too cold for ${activity.toLowerCase()} right now.`;
            else if (current.wind > 20) description = `Too windy for ${activity.toLowerCase()}.`;
            else description = `Conditions aren't ideal for ${activity.toLowerCase()}.`;
        }

        return {
            activity,
            status: isGoodNow ? 'Good' : 'Poor',
            description,
            hourlyForecast
        };
    });
};
