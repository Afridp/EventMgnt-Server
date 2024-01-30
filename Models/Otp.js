const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    managerId: mongoose.Types.ObjectId,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
})
module.exports = mongoose.model("Otp", otpSchema)

 