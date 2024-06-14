const mongoose = require('mongoose')

const formSubmissionsSchema = mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "manager"
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
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

module.exports = formSubmissionsSchema
