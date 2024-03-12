const mongoose = require('mongoose')

const formSubmissionsSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manager"
    },
    forData: {
        type: Object
    }
})

module.exports = mongoose.model('FormSubmissions', formSubmissionsSchema);
 