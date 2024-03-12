const mongoose = require("mongoose")

const walletSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    wallet: {
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
                    type: Date
                },
                
                transactionType: {
                    type: String
                }
            }
        ]
    },
})

module.exports = mongoose.model('Wallet', walletSchema)