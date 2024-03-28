const mongoose = require('mongoose')

const tenantSchema = mongoose.Schema({
  uuid: {
    type: String
  },
  username: {
    type: String,
  },
  companyEmail: {
    type: String,
  },
  password: {
    type: String,
  },
  // companyName: {
  //   type: String,
  //   unique: true
  // },
  companyMobile: {
    type: Number
  },
  isEmailVerified: {
    type: Boolean
  },
  subscribed: {
    type: Boolean
  },
  subscriptionScheme: {
    type: String
  },
  subscriptionStart: {
    type: Date
  },
  subscriptionEnd: {
    type: Date
  },
  domain : {
    type: String
  },
  customize: {
    logo: String,
    homePageImage: String,
    themeColor: String,
    heading: String,
    paragraph: String,
    aboutUs: String
  },
})

module.exports = tenantSchema