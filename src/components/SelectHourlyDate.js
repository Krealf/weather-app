import AppState from './AppState.js'

const rootSelector = '[data-js-select-date]'

class SelectHourlyDate {
  selectors = {
    root: rootSelector,
    openDialog: '[data-js-select-date-button]',
    labelOpenDialog: '[data-js-select-date-label]',
    dialog: '[data-js-select-date-dialog]',
    optionButtons: '[data-js-select-date-option]'
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
    this.openDialogElement = this.rootElement.querySelector(this.selectors.openDialog)
    this.labelOpenDialogElement = this.rootElement.querySelector(this.selectors.labelOpenDialog)
    this.dialogElement = this.rootElement.querySelector(this.selectors.dialog)
    this.optionButtonElements = this.rootElement.querySelectorAll(this.selectors.optionButtons)

    this.bindEvents()

    AppState.on('weather:update', ({ city, data }) => {
      this.renderDate(data)
    })
  }


  bindEvents() {
    this.openDialogElement.addEventListener('click', () => {
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
  }

  toggleDialog() {
    this.initialState.isOpened ? this.closeDialog() : this.openDialog()
  }

  openDialog() {
    this.initialState.isOpened = true
    this.dialogElement.classList.add('is-open')
    this.openDialogElement.setAttribute(
      this.stateAttributes.ariaExpanded,
      'true',
    )

    this.openDialogElement.classList.add('is-expanded')
    this.dialogElement.setAttribute(this.stateAttributes.ariaHidden, 'false')
  }

  closeDialog() {
    this.initialState.isOpened = false
    this.dialogElement.classList.remove('is-open')
    this.openDialogElement.setAttribute(
      this.stateAttributes.ariaExpanded,
      'false',
    )

    this.openDialogElement.classList.remove('is-expanded')
    this.dialogElement.setAttribute(this.stateAttributes.ariaHidden, 'true')
    this.openDialogElement.focus()
  }

  renderDate(data) {
    const currentDate = data.current.time.split('T')[0]
    const days = data.daily.time

    this.dialogElement.innerHTML = ""

    days.forEach(date => {
      const btn = document.createElement('button')
      btn.classList.add('option__button')
      btn.type = 'button'
      btn.dataset.jsSelectDateOption = ''
      btn.dataset.date = date

      btn.textContent = this.formatDay(date)

      if (date === currentDate) {
        btn.setAttribute(this.stateAttributes.ariaPressed, 'true')
        btn.classList.add('is-selected')
        this.labelOpenDialogElement.textContent = btn.textContent
      } else {
        btn.setAttribute(this.stateAttributes.ariaPressed, 'false')
      }

      btn.addEventListener('click', () => {
        this.onDaySelect(btn)
      })

      this.dialogElement.appendChild(btn)
    })

    this.optionButtonElements = this.rootElement.querySelectorAll(this.selectors.optionButtons)
  }

  onDaySelect(btn) {
    this.optionButtonElements.forEach(elem => {
      elem.classList.remove('is-selected')
      elem.setAttribute(this.stateAttributes.ariaPressed, 'false')
    })

    btn.classList.add('is-selected')
    btn.setAttribute(this.stateAttributes.ariaPressed, 'true')

    this.labelOpenDialogElement.textContent = btn.textContent

    AppState.emit('hourly:day-select', {
      selectedDay: btn.dataset.date
    })

    this.closeDialog()
  }

  formatDay(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
    })
  }
}

class SelectHourlyDateCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new SelectHourlyDate(element)
    })
  }
}

export default SelectHourlyDateCollection
