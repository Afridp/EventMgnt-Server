const mongoose = require('mongoose')

const otpSchema = mongoose.Schema({
    managerId: mongoose.Types.ObjectId,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
})
module.exports = otpSchema

 