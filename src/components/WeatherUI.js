import AppState from './AppState.js'
import appState from './AppState.js'

const rootSelector = '[data-js-weather]'

class WeatherUI {
  selectors = {
    city: '[data-js-weather-city]',
    currentTime: '[data-js-weather-current-time]',
    currentIcon: '[data-js-weather-current-icon]',
    currentTemperature: '[data-js-weather-current-temperature]',
    currentApparentTemperature:
      '[data-js-weather-current-apparent-temperature]',
    currentHumidity: '[data-js-weather-current-humidity]',
    currentWind: '[data-js-weather-current-wind]',
    currentPrecipitation: '[data-js-weather-current-precipitation]',
    dailyList: '[data-js-weather-daily-list]',
    hourlyList: '[data-js-weather-hourly-list]',
  }

  stateAttributes = {
    loading: 'data-loading',
  }

  constructor(rootElement) {
    this.rootElement = rootElement
    this.cityElement = rootElement.querySelector(this.selectors.city)
    this.currentTimeElement = rootElement.querySelector(
      this.selectors.currentTime,
    )
    this.currentIconElement = rootElement.querySelector(this.selectors.currentIcon)
    this.currentTemperatureElement = rootElement.querySelector(
      this.selectors.currentTemperature,
    )
    this.currentApparentTemperatureElement = rootElement.querySelector(
      this.selectors.currentApparentTemperature,
    )
    this.currentHumidityElement = rootElement.querySelector(
      this.selectors.currentHumidity,
    )
    this.currentWindElement = rootElement.querySelector(
      this.selectors.currentWind,
    )
    this.currentPrecipitationElement = rootElement.querySelector(
      this.selectors.currentPrecipitation,
    )

    this.dailyListElement = rootElement.querySelector(this.selectors.dailyList)
    this.hourlyListElement = rootElement.querySelector(
      this.selectors.hourlyList,
    )

    AppState.on('weather:update', ({ city, data }) => {
      this.renderCurrent(city, data)
      this.renderDaily(data)
      this.renderHourly(data)
    })

    AppState.on('hourly:day-select', ({ selectedDay }) => {
      const weatherData = AppState.getWeatherData()
      this.renderHourly(weatherData, selectedDay)
    })
  }

  renderCurrent(city, data) {
    const { current, current_units } = data

    const currentTimeISO = new Date(data.current.time)
      .toISOString()
      .slice(0, 16)
    const currentTimeDisplay = new Date(data.current.time).toLocaleString(
      'en-US',
      {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
    )

    this.rootElement.setAttribute(this.stateAttributes.loading, 'false')

    this.cityElement.textContent = city

    this.currentTimeElement.setAttribute('datetime', currentTimeISO)
    this.currentTimeElement.textContent = currentTimeDisplay

    this.currentIconElement.setAttribute('src', this.getWeatherIcon(current['weather_code']))

    this.currentTemperatureElement.textContent = `${Math.round(current.temperature_2m)}°`
    this.currentApparentTemperatureElement.textContent = `${Math.round(current.apparent_temperature)}°`
    this.currentHumidityElement.textContent = `${current.relative_humidity_2m}${current_units.relative_humidity_2m}`
    this.currentWindElement.textContent = `${current.wind_speed_10m} ${current_units.wind_speed_10m}`
    this.currentPrecipitationElement.textContent = `${current.precipitation} ${current_units.precipitation}`
  }

  renderDaily(data) {
    const { time, weather_code, temperature_2m_max, temperature_2m_min } =
      data.daily

    const daily = time.map((t, i) => ({
      time: t,
      tempMax: temperature_2m_max[i],
      tempMin: temperature_2m_min[i],
      code: weather_code[i],
    }))

    this.dailyListElement.innerHTML = daily
      .map((entry) => {
        const iso = entry.time
        const displayTime = new Date(iso).toLocaleString('en-US', {
          weekday: 'short',
        })

        return `
       <li class=daily__item>
        <div class="daily-card skeleton">
          <time datetime="${iso}" class="daily-card__time">${displayTime}</time>
            <img
              class="daily-card__icon"
              src="${this.getWeatherIcon(entry.code)}"
              alt=""
              width="60"
              height="60"
              loading="lazy"
            />
            <div class="daily-card__temperature">
              <span
                class="daily-card__temperature-day"
                data-js-temp-max
              >
                ${Math.round(entry.tempMax)}°
              </span>
              <span
                class="daily-card__temperature-night"
                data-js-temp-min
              >
                ${Math.round(entry.tempMin)}°
              </span>
            </div>
          </div>
       </li>
      `
      })
      .join('')
  }

  renderHourly(data, selectedDay = '', hour = null) {
    const { temperature_2m, weather_code, time } = data.hourly

    const currentISO = data.current.time
    // const currentDate = currentISO.split("T")[0]
    // const currentHour = Number(currentISO.split("T")[1].split(":")[0])

    const targetDay = selectedDay || time[0].split('T')[0]

    let hours = time
      .map((t, i) => ({
        time: t,
        temp: temperature_2m[i],
        code: weather_code[i],
      }))
      .filter((entry) => entry.time.startsWith(targetDay))

    this.hourlyListElement.innerHTML = hours
      .map((entry) => {
        const iso = entry.time
        const displayTime = new Date(iso).toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true,
        })

        return `
         <li class="hourly__item">
            <div class="hourly-card skeleton">
              <div class="hourly-card__body">
                <img
                  class="hourly-card__icon"
                  src="${this.getWeatherIcon(entry.code)}"
                  alt=""
                  width="40"
                  height="40"
                  loading="lazy"
                />
                <time datetime="${iso}" class="hourly-card__time">
                  ${displayTime}
                </time>
              </div>
              <div class="hourly-card__temperature">${Math.round(entry.temp)}°</div>
            </div>
         </li>
      `
      })
      .join('')
  }

  getWeatherIcon(code) {
    const map = {
      0: 'sunny',
      1: 'cloudy',
      2: 'cloudy',
      3: 'cloudy',
      51: 'rain',
      53: 'rain',
      61: 'rain',
      71: 'snow',
    }

    return `./src/assets/icons/weather/${map[code] || 'sunny'}.svg`
  }
}

class WeatherCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new WeatherUI(element)
    })
  }
}

export default WeatherCollection
