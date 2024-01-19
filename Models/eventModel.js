const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    eventName : {
        type : String
    },
    eventDescription : {
        type : String
    },
    eventImage : {
        type : String
    },
    imageBlob : {
        type : String
    },
    list : {
        type : Boolean
    }
})

module.exports = mongoose.model('Event', eventSchema)