const express = require('express')
const customerRoute = express()

const { customerSignin, customerSignup, otpVerification, resendOtp, getEvents, bookEvent, findCustomer, getBookings, getEditingEventData, editBooked, deleteBooked, updateProfilePic, updateProfile, changePassword, getEventFormField } = require('../Controllers/customer')

customerRoute.post('/signup',customerSignup)
customerRoute.post('/otpVerification',otpVerification)
customerRoute.post('/resendOtp/:customerId',resendOtp)
customerRoute.post('/signin',customerSignin)
customerRoute.get('/findCustomer/:customerId',findCustomer)

customerRoute.get('/getEvents',getEvents)
customerRoute.get('/getEventFormField',getEventFormField)
customerRoute.post('/bookEvent/:customerId',bookEvent)
customerRoute.get('/getBookings/:customerId',getBookings)
customerRoute.get('/getEditingEvent/:bookingId',getEditingEventData)
customerRoute.put('/editBooked/:eventId',editBooked)
customerRoute.delete('/deleteBooked/:eventId',deleteBooked)
customerRoute.post('/updateProfilePic',updateProfilePic)
customerRoute.post('/updateProfile',updateProfile)
customerRoute.post('/changePassword',changePassword)

module.exports = customerRoute