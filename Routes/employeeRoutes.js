const express = require('express');
const { employeeRegister } = require('../Controllers/employee');
const employeeRoute = express()

employeeRoute.post('/register',employeeRegister)

module.exports = employeeRoute