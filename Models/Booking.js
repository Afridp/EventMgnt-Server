const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer"
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "event"
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "manager"
  },
  formData: {
    type: Object
  },
  personalData: {
    type: Object
  },
  paidAmount: {
    type: Number
  },
  
},{timestamps : true});



module.exports =  bookingSchema
