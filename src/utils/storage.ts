import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    LOCATION: 'weather_location',
    WEATHER_DATA: 'weather_data',
    AIR_QUALITY: 'air_quality_data',
    SAVED_LOCATIONS: 'saved_locations',
    LAYOUT_PREFERENCES: 'layout_preferences',
    LAYOUT_ORDER: 'layout_order',
    UNITS: 'weather_units',
    THEME: 'weather_theme',
    ENABLED_ACTIVITIES: 'enabled_activities',
    ICON_SET: 'icon_set',
    LAYOUT_DENSITY: 'layout_density',
    SECTION_SIZES: 'section_sizes',
} as const;

export const storage = {
    get: async <T>(key: string): Promise<T | null> => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (!value) return null;
            try {
                return JSON.parse(value);
            } catch {
                // Fallback for non-JSON strings (backward compatibility)
                return value as unknown as T;
            }
        } catch (error) {
            console.error(`Failed to load ${key}`, error);
            return null;
        }
    },

    set: async <T>(key: string, value: T): Promise<void> => {
        try {
            // Always stringify to maintain consistency for future data
            // Note: This will quote strings (e.g., "celsius"), which generic JSON.parse handles correctly
            const stringValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, stringValue);
        } catch (error) {
            console.error(`Failed to save ${key}`, error);
        }
    },

    remove: async (key: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove ${key}`, error);
        }
    },

    clear: async (): Promise<void> => {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Failed to clear storage', error);
        }
    }
};
