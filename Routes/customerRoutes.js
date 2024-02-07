const express = require('express')
const customerRoute = express()

const { customerSignin, customerSignup, otpVerification, resendOtp, getEvents, createEvent, findCustomer, getBookings, getEvent, editBooked, deleteBooked, updateProfilePic, updateProfile, changePassword } = require('../Controllers/customer')

customerRoute.post('/signup',customerSignup)
customerRoute.post('/otpVerification',otpVerification)
customerRoute.post('/resendOtp/:customerId',resendOtp)
customerRoute.post('/signin',customerSignin)
customerRoute.get('/findCustomer/:customerId',findCustomer)

customerRoute.get('/getEvents',getEvents)
customerRoute.post('/bookEvent/:customerId',createEvent)
customerRoute.get('/getBookings/:customerId',getBookings)
customerRoute.get('/getEvent/:eventId',getEvent)
customerRoute.put('/editBooked/:eventId',editBooked)
customerRoute.delete('/deleteBooked/:eventId',deleteBooked)
customerRoute.post('/updateProfilePic',updateProfilePic)
customerRoute.post('/updateProfile',updateProfile)
customerRoute.post('/changePassword',changePassword)
module.exports = customerRoute