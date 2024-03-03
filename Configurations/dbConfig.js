const mongoose = require('mongoose')
require('dotenv').config();




module.exports = {
    connect: () => {
        console.log(typeof process.env.MONGO_URL);
        mongoose.connect(process.env.MONGO_URL).then(() => {
            console.log('database connected')
        }).catch((err) => {
            console.log('database connection faild', err);
        })
    }
} 