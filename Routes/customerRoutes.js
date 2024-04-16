const express = require('express')
const customerRoute = express()

const { customerSignin, customerSignup, otpVerification, resendOtp, getEvents, submitEvent, findCustomer, getBookings, getSeeMoreEventData, editBooked, updateProfilePic, updateProfile, changePassword, getEventFormField, paymentCheckout, topupWallet, getWallet, addBalance, cancelBooked } = require('../Controllers/customer')

customerRoute.post('/:mid/signup', customerSignup)//
customerRoute.post('/:mid/otpVerification', otpVerification)//
customerRoute.post('/resendOtp/:customerId', resendOtp)
customerRoute.post('/:mid/signin', customerSignin)//
customerRoute.get('/:mid/findCustomer/:customerId', findCustomer)//

customerRoute.get('/:mid/getEvents', getEvents)//
customerRoute.get('/:mid/getEventFormField', getEventFormField)//
customerRoute.post('/:mid/submitEvent/:customerId', submitEvent)//
customerRoute.get('/:mid/getBookings/:customerId', getBookings)//
customerRoute.get('/:mid/getEditingEvent/:bookingId', getSeeMoreEventData)//
// customerRoute.put('/editBooked/:eventId', editBooked)
customerRoute.delete('/:mid/cancelBooked/:eventId', cancelBooked)//
customerRoute.post('/:mid/updateProfilePic', updateProfilePic)//
customerRoute.post('/:mid/updateProfile', updateProfile)//
customerRoute.post('/:mid/changePassword', changePassword)//
customerRoute.post('/paymentCheckout', paymentCheckout)
customerRoute.post('/topupWallet', topupWallet)
customerRoute.get('/:mid/getWalletDetails', getWallet)//
customerRoute.post('/:mid/addBalance', addBalance)//

module.exports = customerRoute