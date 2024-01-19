const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    managerId: mongoose.Types.ObjectId,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
})
const otpmodel = mongoose.model("otp", otpSchema)

module.exports = otpmodel