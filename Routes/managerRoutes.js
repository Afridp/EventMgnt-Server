const express = require('express');
const managerRoute = express()
const { managerSignup, managerSignin, otpVerification, resendOtp, addNewEvents, getEvents, editEvent, listingAndUnlist, fetchAllBooking, getEventData, getTodaysEvents, getUpcomingEvents, manageSubscription, isSubscribed, getNewEmployees, approveEmployee, getAllEmployees, blockUnblockEmployee, getNewBookings } = require('../Controllers/manager');
const { checkSubscription, managerTokenVerify } = require("../Middileware/mangerAuth");

managerRoute.post('/signup', managerSignup)
managerRoute.post('/signin', managerSignin)
managerRoute.post('/otpVerification', otpVerification)
managerRoute.post('/resendOtp', resendOtp)

managerRoute.get('/getEvents', getEvents)
managerRoute.post('/addEvent', addNewEvents)
managerRoute.patch('/editEvent', editEvent)
managerRoute.get(`/listing/:eventId`, listingAndUnlist)

managerRoute.get('/getBookedEvents', managerTokenVerify, fetchAllBooking)
managerRoute.get('/getEventData', getEventData)

managerRoute.get('/getTodaysEvents', managerTokenVerify, getTodaysEvents)
managerRoute.get('/getUpcomingEvents', managerTokenVerify, getUpcomingEvents)

managerRoute.post('/subscribe', managerTokenVerify, manageSubscription)
managerRoute.get('/getNewEmployees', getNewEmployees)
managerRoute.get('/approveEmployee',approveEmployee)
managerRoute.get('/getAllEmployees',getAllEmployees)
managerRoute.patch('/blockUnblockEmployee',blockUnblockEmployee)
managerRoute.get('/getNewBookings',getNewBookings)


// managerRoute.get('/isSubscribed', isSubscribed)



module.exports = managerRoute;