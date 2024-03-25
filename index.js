const express = require('express')
const app = express()
const cors = require('cors')
// const connectDB = require('./Configurations/dbConfig');
const managerRoute = require('./Routes/managerRoutes')
const customerRoute = require('./Routes/customerRoutes')
const employeeRoute = require('./Routes/employeeRoutes');
const { startSubscriptionUpdateJob } = require('./Jobs/subscriptionUpdater');
const { subscriptionEndRemainderMail } = require('./Jobs/subscriptionEndMailRemainder');

require('dotenv').config();
// config of dotenv to access env file data

// starting cronJobs(automation jobs)
startSubscriptionUpdateJob()
subscriptionEndRemainderMail()

// const mongoose = connectDB()
// connecting database with config 

app.use(express.json({ limit: '10mb' }))
// middleware for parsing incoming JSON payloads,to make available in route handlers
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
// middleware for parsing the URL encoded data,(html forms datas)

// middleware for setting or configuring the cors and making the connection good
app.use(cors({
    origin: 'http://localhost:3000',
    // allowing the orgins from that can access our backend server,in here only this url can on access this backend,also a security feature to prevent unautorized access
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
}))
      

app.use('/manager', managerRoute)

app.use('/', customerRoute)

app.use('/employee', employeeRoute)

app.listen(5000, () => console.log('server connected'))