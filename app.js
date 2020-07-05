const totalOf = arr => arr.reduce((acc, i) => acc + i.amount, 0)
const sortByAmount = arr => arr.sort((a, b) => a.amount < b.amount)

const getBudget = () => window.Budget
const setBudget = budget => {
  window.Budget = budget
  Data.calculate(budget.raw)
  Tables.All()
}

const Row = {
  create(source, amount) {
    const row = document.createElement('div')
    row.classList.add('relative', 'grid', 'gap-px', 'grid-cols-5', 'my-px', 'items-center')
    row.appendChild(this.source(source))
    row.appendChild(this.amount(amount))
    return row
  },
  source(source) {
    const span = document.createElement('span')
    span.classList.add('source', 'col-span-3', 'h-8', 'py-1', 'px-2', 'border', 'border-gray-400', 'rounded-l', 'font-bold', 'uppercase', 'text-sm', 'text-gray-700', 'flex', 'items-center')
    span.innerText = source
    return span
  },
  amount(amount) {
    const span = document.createElement('span')
    span.classList.add('amount', 'font-mono', 'col-span-2', 'relative', 'h-8', 'py-1', 'px-2', 'border', 'border-gray-400', 'rounded-r', 'text-right', 'font-bold', 'flex', 'items-center', 'justify-end')
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
    ])

    const incomesTable = document.getElementById('total--income')
    incomesTable && this.create(incomesTable, [
      { source: 'Cash' , amount: data.total.income.cash },
      { source: 'Accounts' , amount: data.total.income.accounts },
      { source: 'Upcoming' , amount: data.total.income.upcoming },
      { source: 'Current' , amount: data.total.income.current },
      { source: 'Total' , amount: data.total.income.total }
    ])

    const resultsTable = document.getElementById('result')
    resultsTable && this.create(resultsTable, [
      { source: 'From Current' , amount: data.total.result.fromCurrent },
      { source: 'From Total' , amount: data.total.result.fromTotal }
    ])
  },
  All() {
    this.Income(),
    this.Expenses(),
    this.Results()
  },
  create(table, data) {
    table.innerText = ''
    data.forEach(item => {
      const row = Row.create(item.source, item.amount)
      table.appendChild(row)
    })
  }
}

const Income = {
  Cash: {
    edit() {
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
  remove() {
    const data = getBudget()
    data.raw.expenses = data.raw.expenses.filter(i => i.source.toLowerCase() !== source.toLowerCase())
    setBudget(data)
  },
  find(expenses, source) {
    return expenses.find(i => i.source.toLowerCase() === source.toLowerCase())
  }
}

const Data = {
  async fetch() {
    const res = await fetch('data.json')
    const json = await res.json()
    return json
  },
  calculate(data) {
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
  }
}

const init = async () => {
  const data = await Data.fetch()
  Data.calculate(data)
  Tables.All()
}

document.addEventListener('DOMContentLoaded', () => init())

document.getElementById('test').addEventListener('click', () => {
  Income.Accounts.add('tw', 400)
  Data.calculate(window.Budget.raw)
  Tables.All()
})

document.querySelectorAll('button')
  .forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault()

      if (button.dataset.action === 'form' && button.dataset.section) {
        const form = document.getElementById(`${button.dataset.section}--form`)
        form && form.classList.remove('-translate-y-full')

        form.querySelector('button').dataset.action = button.dataset.form

        if (button.dataset.subsection) {
          const subsectionInput = document.getElementById(`${button.dataset.section}--subsection`)
          if (subsectionInput) subsectionInput.value = button.dataset.subsection
        }

        if (button.dataset.source) {
          const sourceInput = document.getElementById(`${button.dataset.source}--source`)
          if (sourceInput) sourceInput.value = button.dataset.source
        }

        if (button.dataset.amount) {
          const amountInput = document.getElementById(`${button.dataset.amount}--amount`)
          if (amountInput) amountInput.value = button.dataset.amount
        }
    }

    if (button.dataset.action === 'add') {
        const type = button.dataset.section
        const source = document.getElementById(`${type}--form--source`).value
        const amount = parseInt(document.getElementById(`${type}--form--amount`).value)

        if (type === 'income') {
          const subsection = document.getElementById('income--subsection').value
          Income[subsection].change(source, amount)
        } else {
          Expenses.change(source, amount)
        }

        document.getElementById(`${type}--form`).classList.add('-translate-y-full')
      }
    })
  })

document.querySelectorAll('form')
  .forEach(form => form.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) {
      form.classList.add('-translate-y-full')
    }
  }))
