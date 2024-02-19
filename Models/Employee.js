const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    name : {
        type: String
    },
    email : {
        type : String
    },
    phoneNumber : {
        type : Number
    },
    alternativePhoneNumber : {
        type : Number
    },
    age : {
        type : Number
    },
    gender : {
        type : String
    },
    address : {
        type : String
    },
    employeeId : {
        type : String
    },
    employeePassword : {
        type : String
    },
    position : {
        type : String
    },
    status : {
        type : Boolean,
        default : true
    },
    profile : {
        type : String
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    isDataHave : {
        type : Boolean,
        default : false
    },
    // mobile : { 
    //     type : Number
    // },
    // password : { 
    //     type : String
    // },
    // isEmailVerified : {
    //     type : Boolean
    // },
    // profilePic : {
    //     type : String
    // },
    // bookings : [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'clientEvent' 
    //     }
    // ]
    
    
},{timestamps : true})

module.exports = mongoose.model('Employee',employeeSchema)