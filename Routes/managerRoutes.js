const express = require('express');
const managerRoute = express()
const { managerSignup, managerSignin, otpVerification, resendOtp, newEvents, getEvents, editEvent, listingAndUnlist } = require('../Controllers/manager');

managerRoute.post('/signup', managerSignup)
managerRoute.post('/signin', managerSignin)
managerRoute.post('/otpVerification', otpVerification)
managerRoute.post('/resendOtp',resendOtp)
managerRoute.get('/getEvents',getEvents)
managerRoute.post('/addEvent',newEvents)
managerRoute.patch('/editEvent',editEvent)
managerRoute.get(`/listing/:eventId`,listingAndUnlist)




module.exports = managerRoute;