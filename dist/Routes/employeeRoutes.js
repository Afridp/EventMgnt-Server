const express = require('express');
const { employeeLogin, employeeSubmitDetails } = require('../Controllers/employee');
const employeeRoute = express()

employeeRoute.post('/login',employeeLogin)
employeeRoute.post('/submitDetails',employeeSubmitDetails)

module.exports = employeeRoute