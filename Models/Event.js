const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    uuid: {
        type: String, 
        unique: true 
    },
    managerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Manager'
    },
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
    // form : {
    //     type : Array
    // },

    list : {
        type : Boolean
    }
})

module.exports = mongoose.model('Event', eventSchema)