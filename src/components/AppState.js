import WeatherApi from './api/WeatherApi.js'

class AppState {
  constructor() {
    this.city = null

    this.coords = null
    this.weatherData = null

    this.selectedDay = null

    this.units = {
      metricSystem: 'metric',
      temperatureSystem: 'celsius',
      windSystem: 'kmh',
      precipitationSystem: 'mm',
    }

    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(callback)
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data))
    }
  }

  setCity(city, coords) {
    this.city = city
    this.coords = coords

    this.emit('city:changed', {city, coords})
  }

  setWeatherData(data) {
    this.weatherData = data

    this.emit('weather:update', {
      city: this.city,
      data: data,
    })
  }

  async setUnits(newUnits) {
    this.units = { ...this.units, ...newUnits }
    this.emit('units:changed', this.units)

    if (!this.coords) {
      console.warn('No coordinates set — cannot update weather')
      return
    }

    const { lat, lon } = this.coords
    const newWeatherData = await WeatherApi.getWeather(lat, lon, this.getUnits())

    this.setWeatherData(newWeatherData)

    this.emit('weather:update', {
      city: this.city,
      data: this.weatherData,
    })
  }

  getWeatherData() {
    return this.weatherData
  }

  getUnits() {
    return {
      temperature: this.units.temperatureSystem,
      wind: this.units.windSystem,
      precipitation: this.units.precipitationSystem,
    }
  }

  getSystemUnits() {
    return this.units.metricSystem
  }
}

export default new AppState()