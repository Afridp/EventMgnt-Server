const mongoose = require('mongoose') 

const tenantSchema = mongoose.Schema({
  uuid:{
    type : String
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
  companyName: {
    type: String,
    unique: true
  },
  companyMobile:{
    type : Number
  },
  isEmailVerified:{
    type : Boolean
  },
  url : {
    type : String
  }
})

module.exports =  tenantSchema