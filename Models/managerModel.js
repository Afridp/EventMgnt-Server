const mongoose = require('mongoose')

const managerSchema = new mongoose.Schema({
    companyEmail: {
        type: String
    },
    username: {
        type: String
    },
    companyMobile: {
        type: Number
    },
    password: {
        type: String
    },
    isEmailVerified: {
        type: Boolean
    }
})

module.exports = mongoose.model('Manager', managerSchema)