// Weather Service using OpenWeatherMap API

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const WEATHER_ICONS = {
  Clear: '☀️', Clouds: '⛅', Rain: '🌧️', Drizzle: '🌦️',
  Snow: '❄️', Thunderstorm: '⛈️', Mist: '🌫️', Haze: '🌁',
};

export async function getWeather(city) {
  try {
    const res = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();
    return {
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      condition: data.weather[0].main,
      icon: WEATHER_ICONS[data.weather[0].main] || '🌤️',
      windSpeed: Math.round(data.wind.speed * 3.6),
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
    };
  } catch {
    // Mock weather
    const mocks = {
      tokyo: { city: 'Tokyo', country: 'JP', temp: 22, feelsLike: 20, humidity: 65, description: 'partly cloudy', condition: 'Clouds', icon: '⛅', windSpeed: 12, visibility: 10 },
      delhi: { city: 'Delhi', country: 'IN', temp: 38, feelsLike: 42, humidity: 40, description: 'clear sky', condition: 'Clear', icon: '☀️', windSpeed: 8, visibility: 8 },
      default: { city, country: '--', temp: 25, feelsLike: 24, humidity: 60, description: 'pleasant', condition: 'Clear', icon: '☀️', windSpeed: 10, visibility: 10 },
    };
    return mocks[city?.toLowerCase()] || mocks.default;
  }
}

export async function getForecast(city) {
  try {
    const res = await fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&cnt=5`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.list.map(item => ({
      date: new Date(item.dt * 1000).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
      temp: Math.round(item.main.temp),
      icon: WEATHER_ICONS[item.weather[0].main] || '🌤️',
      description: item.weather[0].description,
    }));
  } catch {
    return Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() + i * 86400000).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
      temp: 20 + Math.floor(Math.random() * 10),
      icon: ['☀️', '⛅', '🌧️'][i % 3],
      description: ['clear sky', 'partly cloudy', 'light rain'][i % 3],
    }));
  }
}
