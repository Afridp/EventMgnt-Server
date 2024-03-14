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
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    formData: {
        type: Object
    },
    personalData: {
        type: Object
    },
    status: {
        type: String
    },
    paidAmount: {
        type: Number
    },
    dueDate: {
        type: Date
    }
}, { timestamps: true })

module.exports = mongoose.model('FormSubmissions', formSubmissionsSchema);
