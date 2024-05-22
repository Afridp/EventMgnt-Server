const mongoose = require('mongoose')

const customerSchema = mongoose.Schema({
    userName: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: Number
    },
    password: {
        type: String
    },
    isEmailVerified: {
        type: Boolean
    },
    profilePic: {
        type: String
    },
    wallet : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Wallet'
    },
    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'clientEvent'
        }
    ]

    ,
}, { timestamps: true })

module.exports = customerSchema



