const mongoose = require('mongoose')

const managerSchema = mongoose.Schema({
    uuid: {
        type: String,
        unique: true
    },
    companyEmail: {
        type: String
    },
    username: {
        type: String
    },
    companyName: {
        type: String
    },
    companyMobile: {
        type: Number
    },
    password: {
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    // hostedEvents: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Event"
    //     }
    // ],
    subscribed: {
        type: Boolean,
        default: false
    },
    subscriptionPlan: {
        type: String
    },
    subscriptionStart: {
        type: Date
    },
    subscriptionEnd: {
        type: Date
    },
    isTrailed: {
        type: Boolean,
        default: false
    },
    customize: {
        logo: String,
        homePageImage: String,
        themeColor: String,
        heading: String,
        paragraph: String,
        aboutUs: String
    },

    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "clientEvent"
        }
    ]
})

module.exports =  managerSchema