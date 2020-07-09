const totalOf = arr => arr.reduce((acc, i) => acc + i.amount, 0)
const sortByAmount = arr => arr.sort((a, b) => a.amount < b.amount)

const getBudget = () => window.Budget
const setBudget = budget => {
  window.Budget = budget
  Data.calculate(budget.raw)
  Tables.All()
}

const Row = {
  create(source, amount, isResult = false) {
    const row = document.createElement('div')
    row.classList.add('relative', 'grid', 'gap-px', 'grid-cols-5', 'my-px', 'items-center')
    row.dataset.source = source
    row.dataset.amount = amount
    row.appendChild(this.source(source, isResult))
    row.appendChild(this.amount(amount, isResult))
    return row
  },
  source(source, isResult) {
    const span = document.createElement('span')
    span.classList.add('source', 'col-span-3', 'h-8', 'py-1', 'px-2', 'border', 'border-gray-400', 'rounded-l', 'font-bold', 'uppercase', 'text-sm', 'text-gray-700', 'flex', 'items-center')
    if (!isResult) {
      span.classList.add('editable', 'cursor-pointer',)
    }
    span.innerText = source
    return span
  },
  amount(amount, isResult) {
    const span = document.createElement('span')
    span.classList.add('amount', 'font-mono', 'col-span-2', 'relative', 'h-8', 'py-1', 'px-2', 'border', 'border-gray-400', 'rounded-r', 'text-right', 'font-bold', 'flex', 'items-center', 'justify-end')
    if (!isResult) {
      span.classList.add('editable', 'cursor-pointer',)
    }
    span.innerText = new Intl.NumberFormat().format(parseInt(amount))
    return span
  }
}

const Tables = {
  Income() {
    const data = getBudget()
    const income = data.raw.income

    const cashTable = document.getElementById('income--cash')
    cashTable && this.create(cashTable, income.cash)

    const accountsTable = document.getElementById('income--accounts')
    accountsTable && this.create(accountsTable, sortByAmount(income.accounts))

    const upcomingTable = document.getElementById('income--upcoming')
    upcomingTable && this.create(upcomingTable, sortByAmount(income.upcoming))
  },
  Expenses() {
    const data = getBudget()
    const expenses = data.raw.expenses
    const table = document.getElementById('expenses')
    table && this.create(table, sortByAmount(expenses))
  },
  Results() {
    const data = getBudget()

    const expensesTable = document.getElementById('total--expenses')
    expensesTable && this.create(expensesTable, [
      { source: 'All Expenses' , amount: data.total.expenses }
    ], true)

    const incomesTable = document.getElementById('total--income')
    incomesTable && this.create(incomesTable, [
      { source: 'Cash' , amount: data.total.income.cash },
      { source: 'Accounts' , amount: data.total.income.accounts },
      { source: 'Current' , amount: data.total.income.current },
      { source: 'Upcoming' , amount: data.total.income.upcoming },
      { source: 'Total' , amount: data.total.income.total }
    ], true)

    const resultsTable = document.getElementById('result')
    resultsTable && this.create(resultsTable, [
      { source: 'From Current' , amount: data.total.result.fromCurrent },
      { source: 'From Total' , amount: data.total.result.fromTotal }
    ], true)
  },
  All() {
    this.Income(),
    this.Expenses(),
    this.Results(),
    this.setCurrency()
  },
  create(table, data, isResult = false) {
    table.innerText = ''
    data.forEach(item => {
      const row = Row.create(item.source, item.amount, isResult)
      table.appendChild(row)
    })
  },
  setCurrency() {
    const currency = localStorage.getItem('useCurrency') || '€'
    document.documentElement.style.setProperty('--currency', `'${currency}'`);
    Array.from(document.querySelector('[data-change="currency"]').options)
      .find(o => o.value === currency).selected = 'selected'
  }
}

const Income = {
  Cash: {
    change(source, amount) {
      const data = getBudget()
      data.raw.income.cash[0].amount = amount
      setBudget(data)
    }
  },
  Accounts: {
    change(source, amount) {
      const data = getBudget()
      const account = this.find(data.raw.income.accounts, source)
      account ? this.edit(source, amount) : this.add(source, amount)
    },
    add(source, amount) {
      const data = getBudget()
      data.raw.income.accounts.push({ source, amount })
      setBudget(data)
    },
    edit(source, amount) {
      const data = getBudget()
      const account = this.find(data.raw.income.accounts, source)
      account.amount = amount
      setBudget(data)
    },
    remove(source) {
      const data = getBudget()
      data.raw.income.accounts = data.raw.income.accounts.filter(i => i.source.toLowerCase() !== source.toLowerCase())
      setBudget(data)
    },
    find(accounts, source) {
      return accounts.find(i => i.source.toLowerCase() === source.toLowerCase())
    }
  },
  Upcoming: {
    change(source, amount) {
      const data = getBudget()
      const upcoming = this.find(data.raw.income.upcoming, source)
      upcoming ? this.edit(source, amount) : this.add(source, amount)
    },
    add(source, amount) {
      const data = getBudget()
      data.raw.income.upcoming.push({ source, amount })
      setBudget(data)
    },
    edit(source, amount) {
      const data = getBudget()
      const upcoming = this.find(data.raw.income.upcoming, source)
      upcoming.amount = amount
      setBudget(data)
    },
    remove(source) {
      const data = getBudget()
      data.raw.income.upcoming = data.raw.income.upcoming.filter(i => i.source.toLowerCase() !== source.toLowerCase())
      setBudget(data)
    },
    find(upcoming, source) {
      return upcoming.find(i => i.source.toLowerCase() === source.toLowerCase())
    }
  }
}

const Expenses = {
  change(source, amount) {
    const data = getBudget()
    const expense = this.find(data.raw.expenses, source)
    expense ? this.edit(source, amount) : this.add(source, amount)
  },
  add(source, amount) {
    const data = getBudget()
    data.raw.expenses.push({ source, amount })
    setBudget(data)
  },
  edit(source, amount) {
    const data = getBudget()
    const expense = this.find(data.raw.expenses, source)
    expense.amount = amount
    setBudget(data)
  },
  remove(source) {
    const data = getBudget()
    data.raw.expenses = data.raw.expenses.filter(i => i.source.toLowerCase() !== source.toLowerCase())
    setBudget(data)
  },
  find(expenses, source) {
    return expenses.find(i => i.source.toLowerCase() === source.toLowerCase())
  }
}

const Form = {
  state: {
    show(form) {
      form.classList.remove('-translate-y-full')
      form.querySelectorAll('input')[0].focus()
    },
    hide(form) {
      form.classList.add('-translate-y-full')
    },
    populate(form, dataset) {
      Form.state.show(form)

      const buttons = form.querySelectorAll('button')
      if (buttons[0]) buttons[0].dataset.action = 'change'
      if (buttons[1]) buttons[1].dataset.action = 'remove'
      dataset.addonly ? buttons[1].classList.add('hidden') : buttons[1].classList.remove('hidden')

      if (dataset.subsection) {
        const subsectionInput = form.querySelector(`#${dataset.section}--subsection`)
        if (subsectionInput) subsectionInput.value = dataset.subsection
      }

      if (dataset.source) {
        const sourceInput = form.querySelector(`#${dataset.section}--form--source`)
        if (sourceInput) sourceInput.value = dataset.source
      }

      if (dataset.amount) {
        const amountInput = form.querySelector(`#${dataset.section}--form--amount`)
        if (amountInput) amountInput.value = dataset.amount
      }
    },
  },
  actions: {
    change(form, type) {
      const source = form.querySelector(`[data-input="${type}--source"]`).value
      const amount = parseInt(form.querySelector(`[data-input="${type}--amount"]`).value)

      if (type === 'income') { // errors
        const subsection = form.querySelector('#income--subsection').value
        Income[subsection].change(source, amount)
      } else {
        Expenses.change(source, amount)
      }

      Form.state.hide(form)
    },
    remove(form, type) {
      const source = form.querySelector(`[data-input="${type}--source"]`).value

      if (type === 'income') { // errors
        const subsection = form.querySelector('#income--subsection').value
        Income[subsection].remove(source)
      } else {
        Expenses.remove(source)
      }

      Form.state.hide(form)
    }
  },
}

const Data = {
  async get() {
    const localData = Data.local()
    if (localData) return localData

    return await Data.fetch()
  },
  local() {
    return JSON.parse(localStorage.getItem('budget'))
  },
  async fetch() {
    const res = await fetch('data.json')
    const json = await res.json()
    return json
  },
  calculate(data, isInitial = true) {
    if (!isInitial) {
      window.Budget = data
    } else {

      const expenses = totalOf(data.expenses)
      const cash = totalOf(data.income.cash)
      const accounts = totalOf(data.income.accounts)
      const upcoming = totalOf(data.income.upcoming)

      const current = cash + accounts
      const total = current + upcoming
      const income = { cash, accounts, upcoming, current, total }

      const fromCurrent = current - expenses
      const fromTotal = total - expenses
      const result = { fromCurrent, fromTotal }

      window.Budget = {
        raw: data,
        total: { income, expenses, result }
      }

      localStorage.setItem('useLocalBudget', 1)
    }

    localStorage.setItem('budget', JSON.stringify(window.Budget))
  },
  import: {
    prepare() {
      const textarea = document.getElementById('clipboard')
      textarea.classList.remove('hidden')
      textarea.value = ''
      textarea.focus()
      textarea.placeholder = 'Paste previously exported data here and click Import'
      document.querySelector('[data-action="import"]').dataset.import = 'true'
    },
    do() {
      const textarea = document.getElementById('clipboard')
      textarea.classList.remove('border-red-400')

      try {
        const budget = this.validate(textarea.value)

        setBudget(budget)

        textarea.value = '👍 Data import completed.'
      } catch (error) {
        textarea.classList.add('border-red-400')
        textarea.value = error
        return
      }
      document.querySelector('[data-action="import"]').dataset.import = 'false'
    },
    validate(budget) {
      if (!budget) {
        throw '❌ Paste exported data here to import.'
      }

      let data

      try {
        data = JSON.parse(budget)
      } catch (error) {
        throw '❌ Incorrect Format'
      }

      if (!data.hasOwnProperty('raw') ||
        !data.hasOwnProperty('total') ||
        !data.raw.hasOwnProperty('expenses') ||
        !data.total.hasOwnProperty('income') ||
        !data.total.hasOwnProperty('expenses') ||
        !data.total.hasOwnProperty('income') ||
        !data.total.hasOwnProperty('result')) {

        throw '❌ Incorrect Format'
      }

      return data
    }
  },
  export() {
    const budget = getBudget()
    const textarea = document.getElementById('clipboard')
    textarea.value = JSON.stringify(budget)
    textarea.classList.remove('hidden', 'border-red-400')
    textarea.select()
  }
}

const init = async () => {
  const data = await Data.get()
  const isInitial = !localStorage.getItem('useLocalBudget')
  Data.calculate(data, isInitial)
  Tables.All()
}

document.addEventListener('DOMContentLoaded', () => init())

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('editable')) {
    const source = e.target.closest('[data-source]')?.dataset.source
    const amount = parseInt(e.target.closest('[data-amount]')?.dataset.amount)
    const section = e.target.closest('[data-section]')?.dataset.section
    const subsection = e.target.closest('[data-subsection]')?.dataset.subsection
    const addonly = e.target.closest('[data-addOnly]')?.dataset.addonly

    const dataset = { section, subsection, source, amount, addonly }
    const form = document.getElementById(`${section}--form`)
    Form.state.populate(form, dataset)
  }

  if (e.target.tagName === 'BUTTON') {
    e.preventDefault()
    const button = e.target

    if (button.dataset.action === 'form') {
      const form = document.getElementById(`${button.dataset.section}--form`)
      Form.state.populate(form, button.dataset)
    }

    if (button.dataset.action === 'change') {
      const type = button.dataset.section
      const form = document.getElementById(`${type}--form`)
      Form.actions.change(form, type)
    }

    if (button.dataset.action === 'remove') {
      const type = button.dataset.section
      const form = document.getElementById(`${type}--form`)
      Form.actions.remove(form, type)
    }

    if (button.dataset.action === 'close') {
      const form = button.closest('form')
      Form.state.hide(form)
    }

    if (button.dataset.action === 'settings') {
      const settings = document.getElementById('settings')
      settings.classList.toggle('-translate-x-full')
      settings.classList.toggle('ml-12')
    }

    if (button.dataset.action === 'theme') {
      document.body.classList.toggle('bg-gray-100')
      document.body.classList.toggle('bg-gray-800')
    }

    if (button.dataset.action === 'import') {
      button.dataset.import === 'true' ? Data.import.do() : Data.import.prepare()
    }

    if (button.dataset.action === 'export') {
      Data.export()
    }
  }
})

document.addEventListener('change', (e) => {
  if (e.target.dataset.change === 'currency') {
    const currency = e.target.value
    localStorage.setItem('useCurrency', currency)
    Tables.setCurrency()
  }
})

document.querySelectorAll('form').forEach(form => form.addEventListener('keydown', (e) => e.keyCode === 27 && Form.state.hide(form)))
