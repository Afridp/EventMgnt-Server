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
  personalData : {
    type : Object
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  paidAmount : {
    type : Number
  }
});



module.exports = mongoose.model('Booking', bookingSchema);
