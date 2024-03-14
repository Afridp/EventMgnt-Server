const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manager"
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



module.exports = mongoose.model('Booking', bookingSchema);
