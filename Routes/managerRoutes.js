const express = require('express');
const managerRoute = express()
const { managerSignup, managerSignin, otpVerification, resendOtp, addNewEvents, getEvents, editEvent, listingAndUnlist, fetchAllBooking, getEventData, getTodaysEvents, getUpcomingEvents, manageSubscription, isSubscribed, getNewEmployees, approveEmployee, getAllEmployees, blockUnblockEmployee, getNewSubmissions, addEmployee, submitFormOfEvent, getFormOfEvent, getEmployees, approveEvent, customizedAppearance, fileUploads, customizedContents, completeSubscription, createSubdomain, defaults, updateProfile, fetchProfile } = require('../Controllers/manager');
const { managerTokenVerify } = require("../Middileware/mangerAuth");

managerRoute.get('/',defaults)
managerRoute.post('/createTanent', managerSignup)///
managerRoute.post('/otpVerification', otpVerification)///
managerRoute.post('/completeSubscription', completeSubscription)//
managerRoute.post('/resendOtp', resendOtp)

// managerRoute.post('/createSubdomain',createSubdomain)

managerRoute.post('/signin', managerSignin)//
managerRoute.get('/getTodaysEvents', managerTokenVerify, getTodaysEvents)
managerRoute.get('/getUpcomingEvents', managerTokenVerify, getUpcomingEvents)

managerRoute.get('/getEvents', getEvents)//
managerRoute.post('/addEvent', addNewEvents)//
managerRoute.patch('/editEvent', editEvent)
managerRoute.get(`/listing/:eventId`, listingAndUnlist)//////////////////////////////

managerRoute.get('/getBookedEvents', managerTokenVerify, fetchAllBooking)//
managerRoute.get('/getEventData', getEventData)//
managerRoute.get('/getAllEmployees', getAllEmployees)//
managerRoute.post('/addEmployee', addEmployee)//

// managerRoute.post('/subscribe', managerTokenVerify, manageSubscription) 
managerRoute.patch('/blockUnblockEmployee', blockUnblockEmployee)//
managerRoute.get('/getNewsubmissions', getNewSubmissions)//
managerRoute.get('/getFormOfEvent', getFormOfEvent) //
managerRoute.post('/submitForm', submitFormOfEvent)//

managerRoute.get('/getEmployees', getEmployees)//
managerRoute.post('/approveEvent', approveEvent)//
managerRoute.post('/fileUpload', fileUploads)//
managerRoute.post('/appearancePost', customizedAppearance)//
managerRoute.post('/contentsPost',customizedContents)//
managerRoute.post('/updateProfile', updateProfile)
managerRoute.get('/getProfile',fetchProfile)

// managerRoute.get('/isSubscribed', isSubscribed)



module.exports = managerRoute;


