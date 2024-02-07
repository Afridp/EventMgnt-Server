const express = require('express');
const managerRoute = express()
const { managerSignup, managerSignin, otpVerification, resendOtp, addNewEvents, getEvents, editEvent, listingAndUnlist, fetchAllBooking, getEventData } = require('../Controllers/manager');

managerRoute.post('/signup', managerSignup)
managerRoute.post('/signin', managerSignin)
managerRoute.post('/otpVerification', otpVerification)
managerRoute.post('/resendOtp',resendOtp)

managerRoute.get('/getEvents',getEvents)
managerRoute.post('/addEvent',addNewEvents)
managerRoute.patch('/editEvent',editEvent)
managerRoute.get(`/listing/:eventId`,listingAndUnlist)
managerRoute.get('/getBookedEvents',fetchAllBooking)
managerRoute.get('/getEventData',getEventData)




module.exports = managerRoute;