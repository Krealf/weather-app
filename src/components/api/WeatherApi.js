class WeatherApi {
  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY
  }

  async findCities(query) {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${this.apiKey}`,
    )
    if (!response.ok) {
      throw new Error('City not found!')
    }

    const data = await response.json()

    if (!data.length) {
      throw new Error('City not found!')
    }

    return data
  }

  async getWeather(lat, lon, units = {temperature: 'celsius', wind: 'kmh', precipitation: 'mm' }) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      daily: 'temperature_2m_max,temperature_2m_min,weather_code',
      current: 'temperature_2m,relative_humidity_2m,precipitation,apparent_temperature,wind_speed_10m,weather_code',
      hourly: 'temperature_2m,weather_code',
      timezone: 'auto',
      temperature_unit: units.temperature,
      wind_speed_unit: units.wind,
      precipitation_unit: units.precipitation,
    })

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    )
    if (!response.ok) throw new Error('Weather not found!')
    return await response.json()
  }
}

export default new WeatherApi();
