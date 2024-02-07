const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config(); 
// config of dotenv to access env file data


const db = require('./Configurations/dbConfig')
db.connect()
// connecting database with config 

app.use(express.json({ limit : '10mb'}))
// middleware for parsing incoming JSON payloads,to make available in route handlers
app.use(express.urlencoded({extended:true,limit : '5mb'}))
// middleware for parsing the URL encoded data,(html forms datas)

// middleware for setting or configuring the cors and making the connection good
app.use(cors({
    origin:'http://localhost:3000',
// allowing the orgins from that can access our backend server,in here only this url can on access this backend,also a security feature to prevent unautorized access
    methods:['GET','POST','PATCH','PUT','DELETE']
}))


const managerRoute = require('./Routes/managerRoutes')
app.use('/manager',managerRoute)

const customerRoute = require('./Routes/customerRoutes')
app.use('/',customerRoute)

app.listen(5000,() =>console.log('server connected'))