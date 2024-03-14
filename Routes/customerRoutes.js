const express = require('express')
const customerRoute = express()

const { customerSignin, customerSignup, otpVerification, resendOtp, getEvents, submitEvent, findCustomer, getBookings, getSeeMoreEventData, editBooked, updateProfilePic, updateProfile, changePassword, getEventFormField, paymentCheckout, topupWallet, getWallet, addBalance, cancelBooked } = require('../Controllers/customer')

customerRoute.post('/signup', customerSignup)
customerRoute.post('/otpVerification', otpVerification)
customerRoute.post('/resendOtp/:customerId', resendOtp)
customerRoute.post('/signin', customerSignin)
customerRoute.get('/findCustomer/:customerId', findCustomer)

customerRoute.get('/getEvents', getEvents)
customerRoute.get('/getEventFormField', getEventFormField)
customerRoute.post('/submitEvent/:customerId', submitEvent)
customerRoute.get('/getBookings/:customerId', getBookings)
customerRoute.get('/getEditingEvent/:bookingId', getSeeMoreEventData)
customerRoute.put('/editBooked/:eventId', editBooked)
customerRoute.delete('/cancelBooked/:eventId', cancelBooked)
customerRoute.post('/updateProfilePic', updateProfilePic)
customerRoute.post('/updateProfile', updateProfile)
customerRoute.post('/changePassword', changePassword)
customerRoute.post('/paymentCheckout', paymentCheckout)
customerRoute.post('/topupWallet', topupWallet)
customerRoute.get('/getWalletDetails', getWallet)
customerRoute.post('/addBalance', addBalance)

module.exports = customerRoute