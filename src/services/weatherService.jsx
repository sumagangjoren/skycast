export const fetchWeather = async (lat, lon, unit) => {
    const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day,uv_index&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&temperature_unit=${tempUnit}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    console.log(data)
    return {
        current: {
            temp: data.current.temperature_2m,
            condition: getWeatherCondition(data.current.weather_code),
            conditionCode: data.current.weather_code,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            uvIndex: data.current.uv_index,
            isDay: !!data.current.is_day
        },
        hourly: {
            time: data.hourly.time.slice(0, 24),
            temperature: data.hourly.temperature_2m.slice(0, 24),
            condition: data.hourly.weather_code.slice(0, 24),
        },
        daily: {
            time: data.daily.time,
            tempMax: data.daily.temperature_2m_max,
            tempMin: data.daily.temperature_2m_min,
            condition: data.daily.weather_code,
            sunrise: data.daily.sunrise,
            sunset: data.daily.sunset
        }
    };
};

export const getWeatherIcon = (code, isDay = true) => {
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code <= 3) return isDay ? '⛅' : '☁️';
    if (code <= 48) return '🌫️';
    if (code <= 55) return '🌦️';
    if (code <= 65) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🚿';
    if (code >= 95) return '⛈️';
    return '🌡️';
};

export const getWeatherCondition = (code) => {
    const conditions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
    };
    return conditions[code] || 'Unknown';
};


export const searchLocations = async (query) => {
    if (query.length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map((r) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country,
        admin1: r.admin1
    }));
};