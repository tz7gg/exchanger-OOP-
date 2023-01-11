class Exchanger {
    constructor(mainExchanger, secExchanger, switcher, spinner) {
        this._mainExchanger = document.querySelector(mainExchanger)
        this._secExchanger = document.querySelector(secExchanger)
        this._switcher = document.querySelector(switcher)
        this._spinner = document.querySelector(spinner)
        this._currencies = 'CHF, NOK, CAD, GBP, MXN, CNY, ISK, KRW, HKD, CZK, BGN, BRL, IDR, SGD, PHP, RON, HUF, ILS, THB, SEK, NZD, AUD, DKK, HRK, PLN, TRY, INR, MYR, ZAR, JPY'
            .split(', ')

        this._mainCurrencyValue = 100
        this._secCurrencyValue = 0

        this._mainCurrency = 'RUB'
        this._secCurrency = 'USD'

        this._rates = 0

        this._beforeInput = () => {}
    }

    info() {
        return {
            mainCurrency: this.getMainCurrency(),
            mainCurrencyValue: this.getMainCurrencyValue(),
            secCurrency: this.getSecCurrency(),
            secCurrencyValue: this.getSecCurrencyValue(),
            beforeChange: this._beforeInput,
            switch: this._switcher
        }
    }

    getMain() {
        return this._mainExchanger
    }
    getSec() {
        return this._secExchanger
    }

    getCurrencies() {
        return this._currencies
    }

    getMainInput() {
        return this.getMain().querySelector('input')
    }

    setMainInputValue(value) {
        this.getMainInput().value = value
    }

    getMainInputValue() {
        return this.getMainInput().value
    }

    getMainCurrency() {
        return this._mainCurrency
    }

    getSecCurrency() {
        return this._secCurrency
    }

    setSecCurrencyValue() {
        this._secCurrencyValue = this.getSecInputValue()
    }

    setSecCurrency(value) {
        this._secCurrency = value
    }

    setMainCurrency(value) {
        this._mainCurrency = value
    }

    getSecInputValue() {
        return this.getSecInput().value
    }

    getSecCurrencyValue() {
        return this._secCurrencyValue
    }

    getMainCurrencyValue() {
        return this._mainCurrencyValue
    }

    setMainCurrencyValue(value) {
        this._mainCurrencyValue = value
        this.setMainInputValue(this.getMainCurrencyValue())
        this.setSecInputValue()
    }

    getSecInput() {
        return this.getSec().querySelector('input')
    }

    setSecInputValue() {
        this.getSecInput().value = (this.getMainCurrencyValue() * this.getRates()).toFixed(4)
        this.setSecCurrencyValue()
    }

    getRates() {
        return this._rates
    }

    setRates(value) {
        this._rates = value
    }

    setUnitRatio() {
        this.getMain().querySelector('.unit-ratio').innerHTML = `1 ${this.getMainCurrency()} = ${(1 * this.getRates()).toFixed(4)} ${this.getSecCurrency()}`
        this.getSec().querySelector('.unit-ratio').innerHTML = `1 ${this.getSecCurrency()} = ${(1 / this.getRates()).toFixed(4)} ${this.getMainCurrency()}`
    }

    getSpinner() {
        return this._spinner
    }

    toggleSpinner() {
        if (this.getSpinner()) {
            this.getSpinner().classList.toggle("active")
        }
    }

    getCurrencyBtns(exchanger) {
        return exchanger.querySelectorAll('.currency')
    }

    getCurrencyOption(exchanger) {
        return exchanger.querySelector('.select')
    }

    getCurrencyOptionValue(exchanger) {
        return this.getCurrencyOption(exchanger).value
    }

    getSwicher() {
        return this._switcher
    }

    switch () {
        const tempMainCurrency = this.getMainCurrency()
        const tempSecCurrency = this.getSecCurrency()
        this.setMainCurrency(this.getSecCurrency())
        this.setSecCurrency(tempMainCurrency)
        this.switchBtn(tempMainCurrency, tempSecCurrency)
    }

    switchBtn(tempMainCurrency, tempSecCurrency) {
        //TODO
        this.getCurrencyBtns(this.getMain()).forEach(el => {
            el.classList.remove('selected')
            this.getCurrencyBtns(this.getMain()).forEach(el => {
                if (el.innerHTML == tempSecCurrency) {
                    el.classList.add('selected')
                }
            })
        })
        this.getCurrencyBtns(this.getSec()).forEach(el => {
            el.classList.remove('selected')
            this.getCurrencyBtns(this.getSec()).forEach(el => {
                if (el.innerHTML == tempMainCurrency) {
                    el.classList.add('selected')
                }
            })
        })
    }

    render() {
        this.setMainCurrencyValue(this.getMainInputValue())
        this.setUnitRatio()
    }

    beforeInput(callback) {
        if (callback) {
            this._beforeInput = callback
        } else {
            return this._beforeInput()
        }
    }

    async API() {
        this.toggleSpinner()
        return await fetch(`https://api.exchangerate.host/latest?base=${this.getMainCurrency()}&symbols=${this.getSecCurrency()}`)
            .then(r => r.json()).then(r => {
                this.toggleSpinner()
                this.setRates(r.rates[this.getSecCurrency()])
            })
    }

    async init() {
        await this.API()

        fillCurrenciesList(this.getMain(), this.getCurrencies())
        fillCurrenciesList(this.getSec(), this.getCurrencies())

        this.setMainCurrencyValue(this.getMainCurrencyValue())
        this.render()

        const addHandlerCurrencyBtns = (exchanger) => {
            this.getCurrencyBtns(exchanger).forEach((btn, idx, arr) => {
                btn.addEventListener('click', async() => {
                    arr.forEach((el) => {
                        el.classList.remove('selected')
                    })
                    arr[idx].classList.add('selected')
                    this.getCurrencyOption(exchanger).classList.remove('selected')
                    if (exchanger === this.getMain()) {
                        this.setMainCurrency(arr[idx].innerHTML)
                    } else {
                        this.setSecCurrency(arr[idx].innerHTML)
                    }
                    await this.API()
                    this.render()
                })
            })
        }

        const addHandlerCurrencyOtions = (exchanger) => {
            this.getCurrencyOption(exchanger).addEventListener('change', async() => {
                this.getCurrencyBtns(exchanger).forEach(el => {
                    el.classList.remove('selected')
                })
                this.getCurrencyOption(exchanger).classList.add('selected')
                if (exchanger == this.getMain()) {
                    this.setMainCurrency(this.getCurrencyOptionValue(exchanger))
                } else {
                    this.setSecCurrency(this.getCurrencyOptionValue(exchanger))
                }
                await this.API()
                this.render()
            })
        }

        addHandlerCurrencyBtns(this.getMain())
        addHandlerCurrencyBtns(this.getSec())

        addHandlerCurrencyOtions(this.getMain())
        addHandlerCurrencyOtions(this.getSec())

        this.getMainInput().addEventListener('input', () => {
            this.render()
            this.beforeInput()
        })

        this.getSwicher().addEventListener('click', async() => {
            this.switch()
            await this.API()
            this.render()
        })

        function fillCurrenciesList(exchanger, currencies) {
            exchanger.querySelector('.select').innerHTML = currencies.reduce((acc, currency) => {
                return acc + `<option>${currency}</option>`
            }, '<option selected disabled>more</option>')
        }
    }
}
const exchanger = new Exchanger('#block-1', '#block-2', '.btn-switch', '.spinner')
exchanger.init()

exchanger.getMainInput().addEventListener('input', () => {
    exchanger.beforeInput(() => {
        console.log(exchanger.info())
    })
})