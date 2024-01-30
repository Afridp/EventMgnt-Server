const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    userName : {
        type: String
    },
    email : {
        type : String
    },
    mobile : { 
        type : Number
    },
    password : { 
        type : String
    },
    isEmailVerified : {
        type : Boolean
    },
    bookings : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'clientEvent' 
        }
    ]

})

module.exports = mongoose.model('Customer',customerSchema)