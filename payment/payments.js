// YooMoney Init
const { API, YMPaymentFromBuilder, YMFormPaymentType } = require("yoomoney-sdk");
const api = new API(process.env.YOOMONEY_TOKEN);

let ymAccountNumber = "";

(async () => {
  let info = await api.accountInfo();
  ymAccountNumber = info.account;
})();


// Payments
const amount_and_comission_percent = 1 + parseInt(process.env.COMISSION) / 100

const processed_payments = []

function isProcessed(id) {
    return processed_payments.includes(id);
}

const current_payments = {}

function getPayment(id) {
    return current_payments[id];
}

class Payment {
    constructor(id, buyer, item, amount, comment, embed) {
        this.buyer = buyer;
        this.item = item;
        this.amount = amount;
        this.comment = comment;
        this.embed = embed;
        this.id = id;
        current_payments[this.id] = this;
    }

    sum() {
        return Number(this.amount * amount_and_comission_percent).toFixed(2)
    }

    build() {
        const builder = new YMPaymentFromBuilder({
          quickPayForm: "shop",
          sum: this.sum(),
          successURL: process.env.SUCCESS_URL,
          paymentType: YMFormPaymentType.FromCard,
          receiver: ymAccountNumber,
          label: this.id,
          comment: this.comment
        });
        return builder.buildHtml(true); // true = делаем полную страничку, а не только форму
    }

    url() {
        return process.env.PAY_URL + "?id=" + this.id;
    }

    process() {
        delete current_payments[this.id];
        processed_payments.push(this.id);
    }
}

module.exports = {
    Payment, getPayment, isProcessed
}