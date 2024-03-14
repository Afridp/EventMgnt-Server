const mongoose = require("mongoose")

const walletSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [
        {
            amount: {
                type: Number
            },
            transactionId: {
                type: String
            },
            date: {
                type: Date,
                default : Date.now
            },

            transactionType: {
                type: String
            }
        }
    ]

})

module.exports = mongoose.model('Wallet', walletSchema)