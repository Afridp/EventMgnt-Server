const express = require('express')
const app = express()
const cors = require('cors')
// const connectDB = require('./Configurations/dbConfig');
const managerRoute = require('./Routes/managerRoutes')
const customerRoute = require('./Routes/customerRoutes')
const employeeRoute = require('./Routes/employeeRoutes');
const { startSubscriptionUpdateJob } = require('./Jobs/subscriptionUpdater');
const { subscriptionEndRemainderMail } = require('./Jobs/subscriptionEndMailRemainder');
const ENV = process.env.NODE_ENV

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

// Custom CORS middleware to dynamically set the origin based on the request
const customCorsMiddleware = (req, res, next) => {
    // Extract the subdomain from the request hostname
    console.log(req.hostname,"this is host name");
    const subdomain = req.hostname.split('.')[0];
    console.log(subdomain,"thius is subdomain");

    // Check if the subdomain is 'manager', 'customer', or 'employee'
    // Set the appropriate origin based on the subdomain
    let origin;
    if (subdomain === 'manager' || subdomain === 'customer' || subdomain === 'employee') {
        origin = ENV == "development" ? `http://${subdomain}.localhost:3000` : `https://${subdomain}.brigadge.online`;
        console.log("haai");
    } else {
        // Default origin if subdomain is not recognized
        origin = ENV == "development" ? `http://localhost:3000` : 'https://brigadge.online';
    }

    // Allow other CORS headers
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, role');

    // Continue to the next middleware
    next();
};

// Apply the custom CORS middleware to all routes
app.use(customCorsMiddleware);

// Define middleware to handle dynamic route redirection based on subdomain
const dynamicRouteHandler = (req, res, next) => {
    const subdomain = req.hostname.split('.')[0];

    // Dynamically redirect requests based on the subdomain
    switch (subdomain) {
        case 'manager':

            return managerRoute(req, res, next);

        case 'customer':
            console.log("haai from customer ");
            return customerRoute(req, res, next);

        case 'employee':

            return employeeRoute(req, res, next);
            
        case 'backend':
            // TODO: when deploying
            console.log("hai from backend");
            return managerRoute(req, res, next)
        default:
            // Handle default case if subdomain is not recognized
            // res.status(404).send('Not Fouasdfnsdfd');
    }
};

// Apply the dynamic route handler middleware to all routes
app.use(dynamicRouteHandler);

// Start the server
app.listen(4000, () => console.log('Server connected'));
