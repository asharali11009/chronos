import { WeatherData } from '../types';

// Using Open-Meteo (Free, no key required)
export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await response.json();
    
    if (!data || !data.current_weather) {
      throw new Error('Invalid weather data');
    }

    return {
      temperature: data.current_weather.temperature,
      conditionCode: data.current_weather.weathercode,
      isDay: data.current_weather.is_day === 1,
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    // Return default fallback
    return {
      temperature: 20,
      conditionCode: 0,
      isDay: true,
    };
  }
};

export const getWeatherDescription = (code: number): string => {
  // Simplified WMO Weather interpretation codes
  if (code === 0) return 'Clear sky';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
};