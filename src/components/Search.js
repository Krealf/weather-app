import AppState from './AppState.js'
import WeatherApi from './api/WeatherApi.js'

const rootSelector = '[data-js-weather]'

class Search {
  selectors = {
    root: rootSelector,
    search: '[data-js-search]',
    form: '[data-js-search-form]',
    input: '[data-js-search-input]',
    button: '[data-js-search-button]',
    list: '[data-js-search-list]',
    error: '[data-js-search-error]',
    panel: '[data-js-weather-panel]',
  }

  stateAttributes = {
    loading: 'data-loading'
  }

  constructor(rootElement) {
    this.rootElement = rootElement
    this.searchElement = rootElement.querySelector(this.selectors.search)
    this.formElement = rootElement.querySelector(this.selectors.form)
    this.inputElement = rootElement.querySelector(this.selectors.input)
    this.buttonElement = rootElement.querySelector(this.selectors.button)
    this.listElement = rootElement.querySelector(this.selectors.list)
    this.errorElement = rootElement.querySelector(this.selectors.error)
    this.panelElement = rootElement.querySelector(this.selectors.panel)

    this.bindEvents()
  }

  bindEvents() {
    this.formElement.addEventListener('submit', async (event) => {
      event.preventDefault()

      const query = this.inputElement.value.trim()
      if (!query) return

      this.hideError()
      this.startShowLoadingState()

      try {
        const cities = await WeatherApi.findCities(query)

        this.renderList(cities)
      }
      catch (error) {
        this.stopShowLoadingState()
        this.panelElement.classList.add('is-empty')
        this.showError('No search result found!')
        console.error(error)
      }
    })

    this.listElement.addEventListener('click', async (event) => {
      if (event.target.matches('.search__option')) {
        const { lat, lon , cityname} = event.target.dataset

        this.panelElement.classList.remove('is-empty')
        this.rootElement.setAttribute(this.stateAttributes.loading, 'true')

        AppState.setCity(cityname, {lat, lon})
        const weatherData = await WeatherApi.getWeather(lat, lon, AppState.getUnits())
        AppState.setWeatherData(weatherData)

        this.clearList()
      }
    })

    this.inputElement.addEventListener('click', (event) => {
      if (this.listElement.children.length > 0 && !this.listElement.classList.contains('is-open')) {
        this.showList()
      }
    })

    document.addEventListener('click', (event) => {
      if (!this.inputElement.contains(event.target)) {
        this.closeList();
      }
    })
  }

  renderList(cities) {
    this.listElement.innerHTML = cities
      .map((city) => this.createCityItem(city))
      .join('')

    this.listElement.classList.add('is-open')
  }

  createCityItem(city) {
    return `<li class="search__item">
          <button class="search__option" type="button"
            data-lat="${city.lat}" 
            data-lon="${city.lon}"
            data-cityname="${city.name}, ${city.state ? city.state : city.country}">
            ${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}
          </button>
        </li>`
  }

  startShowLoadingState() {
    this.listElement.innerHTML = `
    <li class="search__item">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 1.25C9 1.96875 8.4375 2.5 7.75 2.5C7.03125 2.5 6.5 1.96875 6.5 1.25C6.5 0.5625 7.03125 0 7.75 0C8.4375 0 9 0.5625 9 1.25ZM7.75 13C8.4375 13 9 13.5625 9 14.25C9 14.9688 8.4375 15.5 7.75 15.5C7.03125 15.5 6.5 14.9688 6.5 14.25C6.5 13.5625 7.03125 13 7.75 13ZM15.5 7.75C15.5 8.46875 14.9375 9 14.25 9C13.5312 9 13 8.46875 13 7.75C13 7.0625 13.5312 6.5 14.25 6.5C14.9375 6.5 15.5 7.0625 15.5 7.75ZM2.5 7.75C2.5 8.46875 1.9375 9 1.25 9C0.53125 9 0 8.46875 0 7.75C0 7.0625 0.53125 6.5 1.25 6.5C1.9375 6.5 2.5 7.0625 2.5 7.75ZM3.125 1.90625C3.84375 1.90625 4.375 2.46875 4.375 3.15625C4.375 3.875 3.84375 4.40625 3.125 4.40625C2.4375 4.40625 1.875 3.875 1.875 3.15625C1.875 2.46875 2.4375 1.90625 3.125 1.90625ZM12.3438 11.125C13.0312 11.125 13.5938 11.6562 13.5938 12.375C13.5938 13.0625 13.0312 13.625 12.3438 13.625C11.625 13.625 11.0938 13.0625 11.0938 12.375C11.0938 11.6562 11.625 11.125 12.3438 11.125ZM3.125 11.125C3.84375 11.125 4.375 11.6562 4.375 12.375C4.375 13.0625 3.84375 13.625 3.125 13.625C2.4375 13.625 1.875 13.0625 1.875 12.375C1.875 11.6562 2.4375 11.125 3.125 11.125Z" fill="white"/>
      </svg>
      <span class="search__info--progress">
        Search in progress
      </span>
    </li>
    `
    this.listElement.classList.add('is-open')
  }

  stopShowLoadingState() {
    this.listElement.innerHTML = ''
    this.listElement.classList.remove('is-open')
  }

  showList() {
    this.listElement.classList.add('is-open')
  }

  closeList() {
    this.listElement.classList.remove('is-open')
  }

  clearList() {
    this.closeList()
    this.listElement.innerHTML = ''
  }

  showError(message = 'Something went wrong!') {
    this.errorElement.textContent = message;
    this.errorElement.classList.add('search__error--visible')
  }

  hideError() {
    this.errorElement.textContent = '';
    this.errorElement.classList.remove('search__error--visible')
  }
}

class SearchCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new Search(element)
    })
  }
}

export default SearchCollection
