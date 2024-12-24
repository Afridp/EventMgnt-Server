const mongoose = require('mongoose')
require('dotenv').config();


const mongoOptions = {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
}



// function connectDB() {
//   return new Promise((resolve, reject) => {
//     const mongoURL = process.env.MONGO_URI;

//     if (mongoose.connection.readyState === 1) {
//       console.log('Already connected to MongoDB');
//       resolve(mongoose.connection);
//     } else {
//       mongoose
//         .connect(mongoURL, mongoOptions)
//         .then((conn) => {
//           console.log('Connected to MongoDB');
//           resolve(conn);
//         })
//         .catch((error) => {
//           console.error('Failed to connect to MongoDB:', error);
//           reject(error);
//         });
//     }
//   });
// }

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return mongoose.connection;
  }

  const mongoURL = process.env.MONGO_URI;

  try {
      const conn = await mongoose.connect(mongoURL, mongoOptions);
      console.log('Connected to MongoDB');
      return conn;
  } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
  }
}

module.exports = connectDB;
