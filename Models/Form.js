const mongoose = require("mongoose")

const formsSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager'
    },
    formFields: {
        type: Array
    },
    personalFormFields: {
      type : Boolean
    }

})

module.exports = mongoose.model('Form', formsSchema)