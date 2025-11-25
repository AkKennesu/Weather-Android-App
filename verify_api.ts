import { fetchWeather, searchCity, fetchHistory } from './src/api/weather';

async function testApi() {
    console.log('Testing API...');

    try {
        // 1. Search City
        console.log('\n1. Testing searchCity("London")...');
        const locations = await searchCity('London');
        console.log(`Found ${locations.length} locations.`);
        if (locations.length > 0) {
            console.log('First result:', locations[0].name, locations[0].country);

            const { latitude, longitude } = locations[0];

            // 2. Fetch Weather
            console.log(`\n2. Testing fetchWeather(${latitude}, ${longitude})...`);
            const weather = await fetchWeather(latitude, longitude);
            console.log('Current Temp:', weather.current_weather.temperature);
            console.log('Forecast Days:', weather.daily.time.length);

            // 3. Fetch History
            console.log(`\n3. Testing fetchHistory(${latitude}, ${longitude})...`);
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const history = await fetchHistory(latitude, longitude, startDate, endDate);
            console.log('History Days:', history.daily.time.length);
        } else {
            console.error('No locations found for London.');
        }

        console.log('\nAPI Test Passed!');
    } catch (error) {
        console.error('API Test Failed:', error);
    }
}

testApi();
