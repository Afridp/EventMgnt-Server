const express = require('express')
const clientRoute = express()

const { clientLogin, clientSignup, otpVerification, resendOtp } = require('../Controllers/client')

clientRoute.post('/signup',clientSignup)
clientRoute.post('/otpVerification',otpVerification)
clientRoute.post('/resendOtp',resendOtp)
clientRoute.post('/singin',clientLogin)



module.exports = clientRoute