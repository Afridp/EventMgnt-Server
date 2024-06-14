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
    const requestOrigin = req.headers.origin
    // const subdomain = req.headers.split('.')[0];

    // Check if the subdomain is 'manager', 'customer', or 'employee'
    // console.log(subdomain, "this is subdomain");
    // Set the appropriate origin based on the subdomain
    // console.log(req.hostname, "this is hostname");


    // If the request origin is trusted (e.g., your client-side application domains/subdomains)
    if (isTrustedOrigin(requestOrigin)) {
        // Set the Access-Control-Allow-Origin header with the request origin
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else {
        // If the origin is not trusted, you can either:
        // 1. Deny the request by not setting the Access-Control-Allow-Origin header
        // 2. Set a default origin (e.g., your website domain)
        res.setHeader('Access-Control-Allow-Origin', 'https://your-website.com');
    }
    // if (subdomain === 'manager' || subdomain === 'customer' || subdomain === 'employee' || subdomain === 'managerbackend' || subdomain === 'employeebackend' || subdomain === 'customerbackend' || subdomain === 'backend') {
    //     origin = ENV === "development" ? `http://${subdomain}.localhost:3000` : `https://${subdomain}.brigadge.online`;

    // } else {
    //     // Default origin if subdomain is not recognized
    //     origin = ENV === "development" ? `http://localhost:3000` : 'https://brigadge.online';
    // }

    // Allow other CORS headers

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, role');

    // Continue to the next middleware
    next();
};

// Helper function to check if the origin is trusted
const isTrustedOrigin = (origin) => {
    // List of trusted origins (e.g., your client-side application domains/subdomains)
    const trustedOrigins = [
        'https://manager.brigadge.online',
        'https://customer.brigadge.online',
        'https://employee.brigadge.online',
        'https://brigadge.online',
        'http://employee.localhost:3000',
        'http://manager.localhost:3000',
        'http://customer.localhost:3000',
        'http://localhost:3000'
        // Add more trusted origins as needed
    ];

    // Check if the origin is in the list of trusted origins
    return trustedOrigins.includes(origin);
};

// Apply the custom CORS middleware to all routes
app.use(customCorsMiddleware);

// // Define middleware to handle dynamic route redirection based on subdomain
// const dynamicRouteHandler = (req, res, next) => {
//     const subdomain = req.hostname.split('.')[0];

//     // Dynamically redirect requests based on the subdomain
//     switch (subdomain) {
//         case 'manager':
//             return managerRoute(req, res, next);
//         case 'customer':
//             return customerRoute(req, res, next);
//         case 'employee':
//             return employeeRoute(req, res, next);
//         case 'backend':
//             // TODO: when deploying
//             return managerRoute(req, res, next)
//         case 'localhost':
//             return managerRoute(req, res, next)
//         default:
//             return managerRoute(req, res, next)
//         // Handle default case if subdomain is not recognized
//         // res.status(404).send('Not Fouasdfnsdfd');
//     }
// };

const dynamicRouteHandler = (req, res, next) => {
    const allowedOrigins = [
        'https://manager.brigadge.online',
        'https://customer.brigadge.online',
        'https://employee.brigadge.online',
        'https://brigadge.online',
        'http://employee.localhost:3000',
        'http://manager.localhost:3000',
        'http://customer.localhost:3000',
        'http://localhost:3000'
    ];

    // Check if the request origin is allowed
    if (allowedOrigins.includes(req.headers.origin)) {
        const subdomain = req.headers.origin.split('.')[0].split('://')[1];

        // Dynamically redirect requests based on the subdomain
        switch (subdomain) {
            case 'manager':
                return managerRoute(req, res, next);
            case 'customer':
                return customerRoute(req, res, next);
            case 'employee':
                return employeeRoute(req, res, next);
            default:
                // Handle other subdomains or default case
                return managerRoute(req, res, next);
        }
    } else {
        // If the origin is not allowed, return a 403 Forbidden response
        res.status(403).send('Forbidden');
    }
};

// Apply the dynamic route handler middleware to all routes
app.use(dynamicRouteHandler);

// Start the server
app.listen(4000, () => console.log('Server connected'));
