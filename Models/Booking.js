const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Customer"
  },
  startDate: {
    type: String,
    // required: true,
  },
  endDate: {
    type: String
    // required: true,
  },
  guestRequirement: {
    type: String, // You might want to use a more specific type depending on your requirements
    // required: true,
  },
  cateringNeeds: {
    type: String  , // You might want to use a more specific type depending on your requirements
    // required: true,
  },
  eventName: {
    type: String,
    // required: true,
  },
  eventCategory: {
    type: String,
    // required: true,
  },
  venueName: {
    type: String,
    // required: true,
  },
  venueType: {
    type: String,
    // required: true,
  },
  venueLocation: {
    type: String,
    // required: true,
  },
  noofGuests: {
    type: Number,
    // required: true,
  },
  numberOfServices: {
    type: Number,
    // required: true,
  },
  foodPreference : {
    type : String
  },
  cuisines : {
    type : String,
  },
  desiredEntertainment : {
    type : String
  },
  entertainer : {
    type : String
  },
  eventTheme : {
    type : String
  },
  otherTheme : {
    type : String
  },
  themeImage : {
    type : String
  },
  audioVisual : {
    type : String
  },
  techSupport : {
    type : String
  },
  additionalRequirement : { 
    type : String
  },
  name : {
    type : String
  },
  email : {
    type : String
  },
  phoneNumber : {
    type : Number
  },
  alternativePhoneNumber : {
    type : Number
  }
});



module.exports =  mongoose.model('Booking', bookingSchema);
