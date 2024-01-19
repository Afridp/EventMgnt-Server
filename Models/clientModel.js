const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
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
    }

})

module.exports = mongoose.model('Client',clientSchema)