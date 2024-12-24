const mongoose = require("mongoose")

const formsSchema = mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event'
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'manager'
    },
    formFields: {
        type: Array
    },
    personalFormFields: {
      type : Boolean
    }

})

module.exports = formsSchema