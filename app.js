const currencySymbol = currency => currency === 'usd' ? '$' : '€'

const makeRow = (source, amount, currency = 'eur') => {
  const row = document.createElement('div')
  row.classList.add('grid', 'gap-px', 'grid-cols-5', 'my-px', 'items-center')

  const sourceSpan = document.createElement('span')
  sourceSpan.classList.add('source', 'col-span-3', 'h-8', 'py-1', 'px-2', 'border', 'border-gray-400', 'rounded-l', 'font-bold', 'uppercase', 'text-sm', 'text-gray-700', 'flex', 'items-center')
  sourceSpan.innerText = source

  const amountSpan = document.createElement('span')
  amountSpan.classList.add('amount', 'col-span-2', 'relative', 'h-8', 'py-1', 'px-2', 'border', 'border-gray-400', 'rounded-r', 'text-right', 'font-bold', 'flex', 'items-center', 'justify-end')
  amountSpan.innerText = new Intl.NumberFormat().format(parseInt(amount))

  row.appendChild(sourceSpan)
  row.appendChild(amountSpan)

  return row
}

const makeTable = (wrapper, data) => {
  wrapper.innerText = ''
  data.forEach(item => {
    const row = makeRow(item.source, item.amount, item?.currency)
    wrapper.appendChild(row)
  })
}

const incomeTables = () => {
  const income = Budget.raw.income

  const cashTable = document.getElementById('income--cash')
  cashTable && makeTable(cashTable, income.cash)

  const accountsTable = document.getElementById('income--accounts')
  accountsTable && makeTable(accountsTable, income.accounts)

  const upcomingTable = document.getElementById('income--upcoming')
  upcomingTable && makeTable(upcomingTable, income.upcoming)
}

const expensesTable = () => {
  const table = document.getElementById('expenses')
  table && makeTable(table, Budget.raw.expenses)
}

const totalsTables = () => {
  makeTable(document.getElementById('total--expenses'), [
    { source: 'All Expenses' , amount: Budget.total.expenses }
  ])

  makeTable(document.getElementById('total--income'), [
    { source: 'Cash' , amount: Budget.total.income.cash },
    { source: 'Accounts' , amount: Budget.total.income.accounts },
    { source: 'Upcoming' , amount: Budget.total.income.upcoming },
    { source: 'Current' , amount: Budget.total.income.current },
    { source: 'Total' , amount: Budget.total.income.total }
  ])

  makeTable(document.getElementById('result'), [
    { source: 'From Current' , amount: Budget.total.result.fromCurrent },
    { source: 'From Total' , amount: Budget.total.result.fromTotal }
  ])
}

const populateTables = () => {
  incomeTables()
  expensesTable()
  totalsTables()
}

const totalOf = arr => arr.reduce((acc, i) => acc + i.amount, 0)
const calculateTotals = data => {
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

const fetchData = async () => {
  const res = await fetch('data.json')
  const json = await res.json()
  return json
}

const init = async () => {
  const data = await fetchData()

  calculateTotals(data)
  populateTables()
}

document.addEventListener('DOMContentLoaded', () => init())

// document.querySelector('button').addEventListener('click', () => {
//   Budget.raw.expenses.push({ 'source': 'Vodafone', 'amount': 25 })
//   populateTables()
// })
