const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
    // uuid: {
    //     type: String, 
    //     unique: true 
    // },
    managerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'manager'
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
    managerUUID : {
        type : String
    },
    list : {
        type : Boolean
    }
})

module.exports = eventSchema