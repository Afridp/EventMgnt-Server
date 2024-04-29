const mongoose = require('mongoose')
require('dotenv').config();


const mongoOptions = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
}



function connectDB() {
  return new Promise((resolve, reject) => {
    const mongoURL = process.env.MONGO_URI;
    
    mongoose
      .connect(mongoURL, mongoOptions)
      .then((conn) => {
        console.log('Connected to MongoDB');
        resolve(conn);
      })
      .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        reject(error);
      });
  });
}

module.exports = connectDB;
