//Open Modal
const Modal = {
  open(){
    // Abrir modal
    // Adicionar a classe active ao modal
    document
      .querySelector('.modal-overlay')
      .classList
      .add('active')
  },
  close() {
    // Fechar modal
    // Remover a classe active ao modal
    document
      .querySelector('.modal-overlay')
      .classList
      .remove('active')
  }
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions"))  || []
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

// Transactions in app 
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },
  

  incomes() {
    let income = 0;
    //pegar todas as transações 
    Transaction.all.forEach((transaction)=>{
      // para cada transação se for maior que zero
      if (transaction.amount > 0) {
        // somar uma variável e retornar ela
        income += transaction.amount;
      }
    })

    return income
  },
  expenses() {
    let expense = 0;
    //pegar todas as transações 
    Transaction.all.forEach((transaction)=>{
      // para cada transação se for menor que zero
      if (transaction.amount < 0) {
        // somar uma variável e retornar ela
        expense += transaction.amount;
      }
    })

    return expense
  },
  total() {
    //entradas - saídas 
    return Transaction.incomes() + Transaction.expenses();
  }
}

// Substituir os dados do HTML pelos do Javascript
// eu preciso pegar as transações do JS e botar no HTML
const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)

  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : " expense"

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `

    return html;
  },

  upadateBalance() { 
    document
      .querySelector('#income-display')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .querySelector('#expense-display')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .querySelector('#total-display')
      .innerHTML = Utils.formatCurrency(Transaction.total())
    document
      .querySelector('.card.total')
      .classList
      .remove(Utils.setTotalColor(Transaction.total() * -1))
    document
      .querySelector('.card.total')
      .classList
      .add(Utils.setTotalColor(Transaction.total()))

    console.log(Utils.setTotalColor(Transaction.total()))
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100

    return value
  },

  formatDate(date) {
    // split aplicado em strings split("separador") e retorna um array
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    // rejex - expressão regular
    // usar o g depois do valor a ser procurado é usado de maneira geral
    // / / definem a expressão regular
    // \ mostra a oposição 
    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  },

  setTotalColor(value) {
    const CSSclass = value > 0 ? "positive" : "negative"

    return CSSclass
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields() {
    
    const {description, amount, date} = Form.getValues()

    if( description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor preencha todos os campos")
    }
  },
  formatValues() {
      let {description, amount, date} = Form.getValues()

      amount = Utils.formatAmount(amount)
      date= Utils.formatDate(date);
      return {
        description,
        amount,
        date
      }
  },

  saveTransaction(transaction){
    Transaction.add(transaction)
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault();

    try {
      // verificar se todas as informações foram preenchidas
      Form.validateFields();
      // formatar os dados para salvar
      const transaction = Form.formatValues();
      // salvar e atualizar
      Form.saveTransaction(transaction)
      // apagar os dados do formulário
      Form.clearFields()
      //modal feche
      Modal.close()
    } catch (error){
      alert(error.message)
    }

  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index)=>{
      DOM.addTransaction(transaction, index)
    })

    DOM.upadateBalance();

    Storage.set(Transaction.all)
    /*
    alternativa:
      Transaction.all.forEach(DOM.addTransaction)
    */
    
    DOM.upadateBalance();
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()

