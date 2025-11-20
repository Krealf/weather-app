import AppState from './AppState.js'

const rootSelector = '[data-js-select-units]'

class SelectUnis {
  selectors = {
    root: rootSelector,
    optionButton: '[data-js-select-units-button]',
    dialog: '[data-js-select-units-dialog]',
    switchMetrics: '[data-js-select-units-switch-metrics]',
    tempCelsiusButton: '[data-js-select-units-temperature-celsius]',
    tempFahrenheitButton: '[data-js-select-units-temperature-fahrenheit]',
    windKMButton: '[data-js-select-units-wind-km]',
    windMPHButton: '[data-js-select-units-wind-mph]',
    precipitationMMButton: '[data-js-select-units-precipitation-millimeters]',
    precipitationINButton: '[ data-js-select-units-precipitation-inches]',
  }

  stateAttributes = {
    ariaPressed: 'aria-pressed',
    ariaExpanded: 'aria-expanded',
    ariaHidden: 'aria-hidden',
    ariaLabel: 'aria-label',
  }

  initialState = {
    isOpened: false,
  }

  constructor(rootElement) {
    this.rootElement = rootElement
    this.optionButtonElement = this.rootElement.querySelector(
      this.selectors.optionButton,
    )
    this.dialogElement = this.rootElement.querySelector(this.selectors.dialog)
    this.switchMetricsElement = this.rootElement.querySelector(
      this.selectors.switchMetrics,
    )
    this.tempCelsiusButtonElement = this.rootElement.querySelector(
      this.selectors.tempCelsiusButton,
    )
    this.tempFahrenheitButtonElement = this.rootElement.querySelector(
      this.selectors.tempFahrenheitButton,
    )
    this.windKMButtonElement = this.rootElement.querySelector(
      this.selectors.windKMButton,
    )
    this.windMPHButtonElement = this.rootElement.querySelector(
      this.selectors.windMPHButton,
    )
    this.precipitationMMButtonElement = this.rootElement.querySelector(
      this.selectors.precipitationMMButton,
    )
    this.precipitationINButtonElement = this.rootElement.querySelector(
      this.selectors.precipitationINButton,
    )

    this.bindEvents()
  }

  bindEvents() {
    this.optionButtonElement.addEventListener('click', () => {
      this.toggleDialog()
    })

    document.addEventListener('click', (event) => {
      if (
        !this.rootElement.contains(event.target) &&
        this.initialState.isOpened
      ) {
        this.closeDialog()
      }
    })

    this.bindUnitButton(
      this.tempCelsiusButtonElement,
      'temperatureSystem',
      'celsius',
      'fahrenheit',
      this.tempFahrenheitButtonElement,
    )
    this.bindUnitButton(
      this.windKMButtonElement,
      'windSystem',
      'kmh',
      'mph',
      this.windMPHButtonElement,
    )
    this.bindUnitButton(
      this.precipitationMMButtonElement,
      'precipitationSystem',
      'mm',
      'inch',
      this.precipitationINButtonElement,
    )

    this.switchMetricsElement.addEventListener('click', () => {
      this.switchSystem()
    })
  }

  toggleDialog() {
    this.initialState.isOpened ? this.closeDialog() : this.openDialog()
  }

  openDialog() {
    this.initialState.isOpened = true
    this.dialogElement.classList.add('is-open')
    this.optionButtonElement.setAttribute(
      this.stateAttributes.ariaExpanded,
      'true',
    )

    this.optionButtonElement.classList.add('is-expanded')

    this.dialogElement.setAttribute(this.stateAttributes.ariaHidden, 'false')
  }

  closeDialog() {
    this.initialState.isOpened = false
    this.dialogElement.classList.remove('is-open')
    this.optionButtonElement.setAttribute(
      this.stateAttributes.ariaExpanded,
      'false',
    )

    this.optionButtonElement.classList.remove('is-expanded')

    this.dialogElement.setAttribute(this.stateAttributes.ariaHidden, 'true')
  }

  updateButtonUI(active, inactive) {
    active.setAttribute(this.stateAttributes.ariaPressed, 'true')
    inactive.setAttribute(this.stateAttributes.ariaPressed, 'false')

    active.classList.add('is-selected')
    inactive.classList.remove('is-selected')
  }

  switchSystem() {
    if (AppState.getSystemUnits() === 'metric') {
      AppState.setUnits({
        metricSystem: 'imperial',
        temperatureSystem: 'fahrenheit',
        windSystem: 'mph',
        precipitationSystem: 'inch',
      })
      this.switchMetricsElement.textContent = 'Switch to Metric'

      this.updateButtonUI(
        this.tempFahrenheitButtonElement,
        this.tempCelsiusButtonElement,
      )
      this.updateButtonUI(this.windMPHButtonElement, this.windKMButtonElement)
      this.updateButtonUI(
        this.precipitationINButtonElement,
        this.precipitationMMButtonElement,
      )
    } else {
      AppState.setUnits({
        metricSystem: 'metric',
        temperatureSystem: 'celsius',
        windSystem: 'kmh',
        precipitationSystem: 'inch',
      })
      this.switchMetricsElement.textContent = 'Switch to Imperial'

      this.updateButtonUI(
        this.tempCelsiusButtonElement,
        this.tempFahrenheitButtonElement,
      )
      this.updateButtonUI(this.windKMButtonElement, this.windMPHButtonElement)
      this.updateButtonUI(
        this.precipitationMMButtonElement,
        this.precipitationINButtonElement,
      )
    }
  }

  bindUnitButton(
    button,
    unitKey,
    unitValue,
    oppositeUnitValue,
    oppositeButton,
  ) {
    button.addEventListener('click', () => {
      AppState.setUnits({ [unitKey]: unitValue })
      this.updateButtonUI(button, oppositeButton)
    })

    oppositeButton.addEventListener('click', () => {
      AppState.setUnits({ [unitKey]: oppositeUnitValue })
      this.updateButtonUI(oppositeButton, button)
    })
  }
}

class SelectUnitsCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new SelectUnis(element)
    })
  }
}

export default SelectUnitsCollection
