const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Customer = require('../Models/Customer')
const hash = require('../Utils/bcryptPassword')
const sendToMail = require('../Utils/mailSender')
const Otp = require('../Models/Otp')
const Event = require('../Models/Event')
const Booking = require("../Models/Booking");
const cloudinary = require('../Utils/cloudinary')




const customerSignin = async (req, res) => {
    try {
        const { signinDetails, password } = req.body

        const existCustomer = await Customer.findOne({
            $or: [
                { email: signinDetails },
                { username: signinDetails }
            ]
        })

        if (existCustomer) {

            if (existCustomer.isEmailVerified) {
                const isPassword = await bcrypt.compare(password, existCustomer.password)

                if (isPassword) {
                    const token = jwt.sign({ clientId: existCustomer._id, role: 'client' }, process.env.TOKEN_KEY, { expiresIn: '5min' })
                    res.status(200).json({ customerData: existCustomer, token, message: "login success" })
                } else {
                    res.status(401).json({ message: 'Password is incorrect,please try again' })
                }
            } else {
                res.status(403).json({ massage: 'Sorry..! Account needs to be verified' })
            }
        } else {

            res.status(401).json({ message: "You are not registered with us please register to login" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const otpVerification = async (req, res) => {
    try {
        const { enteredOtp, customerId, otpId } = req.body

        const isOtp = await Otp.findOne({ _id: otpId })
        const correctOtp = isOtp.otp

        const { expiresAt } = isOtp

        if (correctOtp && expiresAt < Date.now()) {
            return res.status(403).json({ message: "Otp is expired" })
        }
        if (correctOtp === enteredOtp) {

            await Otp.deleteMany({ _id: otpId });
            await Customer.updateOne({ _id: customerId }, { $set: { isEmailVerified: true } });

            res.status(200).json({ status: true, message: "Registered succesfully You can login now" })
        } else {
            res.status(401).json({ message: "Incorrect Otp,try again" })
        }

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const resendOtp = async (req, res) => {
    try {
        const { customerId } = req.params

        const data = await Customer.findOne({ _id: customerId })

        const otpId = await sendToMail(data.userName, data.email, data._id)
        if (otpId) {
            res.status(200).json({ message: `New otp sent to ${data.email}` })
        } else {
            res.status(401).json({ message: "Otp send failed,please try again" })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const customerSignup = async (req, res) => {
    try {
        const { email, username, mobile, password } = req.body

        const existCostomer = await Customer.findOne({
            $or: [
                { mobile: mobile },
                { email: email }
            ]
        })

        if (existCostomer) {
            res.status(409).json({ message: "You have already registered with us,please login" })
        } else {
            const spassword = await hash.hashPassword(password)

            const newCustomer = new Customer({
                email: email,
                userName: username,
                mobile: mobile,
                password: spassword,
                isEmailVerified: false
            })

            const savedCustomer = newCustomer.save()

            const otpId = await sendToMail((await savedCustomer).userName, (await savedCustomer).email, (await savedCustomer)._id)

            res.status(200).json({ customerId: (await savedCustomer)._id, otpId, message: `otp has been sent to ${email}` })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}

const findCustomer = async (req, res) => {
    try {
        const { customerId } = req.params
        const isCustomerAvailable = await Customer.findById(customerId)

        if (isCustomerAvailable) {
            res.status(200).json({ customer: isCustomerAvailable })
        } else {
            res.status(401).json({ message: "something went wrong,please login" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}

const getEvents = async (req, res) => {
    try {

        const { search, sort } = req.query
        const query = { list: true };

        if (search) {
            query.eventName = { $regex: new RegExp(search, 'i') };
        }

        let events

        if (sort) {
            if (sort === 'eventNameAscending') {
                events = await Event.find(query)
                    .sort({ eventName: 1 })
            } else if (sort === 'eventNameDescending') {
                events = await Event.find(query)
                    .sort({ eventName: -1 })
            }
        } else {
            events = await Event.find(query)
        }
        res.status(200).json({ events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const createEvent = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            guestRequirement,
            cateringNeeds,
            eventName,
            eventCategory,
            venueName,
            venueType,
            noofGuests,
            numberOfServices,
            foodPreference,
            cuisines,
            desiredEntertainment,
            entertainer,
            eventTheme,
            otherTheme,
            themeImage,
            audioVisual,
            techSupport,
            additionalRequirement,
            name,
            email,
            phoneNumber,
            alternativePhoneNumber,
            location,
        } = req.body;
        const { customerId } = req.params;

       

        let image = null
        if (themeImage) {
            let uploaded = await cloudinary.uploader.upload(themeImage, {
                public_id: `booking/${eventName}`,
                // uload_preset: 'mi_default',

                // check what is upload preset is
            });
            image = uploaded.secure_url
        }

        const newEvent = new Booking({
            customerId,
            startDate,
            endDate,
            guestRequirement,
            cateringNeeds,
            eventName,
            eventCategory,
            venueName,
            venueType,
            venueLocation: location,
            audioVisual,
            noofGuests,
            numberOfServices,
            foodPreference,
            cuisines,
            desiredEntertainment,
            entertainer,
            eventTheme,
            otherTheme,
            themeImage: image,
            techSupport,
            additionalRequirement,
            name,
            email,
            phoneNumber,
            alternativePhoneNumber,
        });

        const savedEvent = await newEvent.save();

        res.status(201).json({ message: "Event created successfully", event: savedEvent });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" });
    }
};


const getBookings = async (req, res) => {
    try {
        const { customerId } = req.params
        const { search, sort } = req.query

        let query = { customerId: customerId }

        if (search) {
            query.eventName = { $regex: new RegExp(search, 'i') };
        }

        let bookings

        if (sort) {
            if (sort === 'dateAscending') {
                bookings = await Booking.find(query)
                    .sort({ startDate: 1 })
            } else if (sort === 'dateDescending') {
                bookings = await Booking.find(query)
                    .sort({ startDate: -1 })
            }
        } else {
            bookings = await Booking.find(query)
        }
        if (bookings.length) {
            
            res.status(200).json({ bookings })
        } else {
            res.status(204).json({ message: "no data" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}

const getEvent = async (req, res) => {
    try {
        const { eventId } = req.params

        const event = await Booking.findById(eventId)

        if (event) {
            res.status(200).json({ event })
        } else {
            res.status(204).json({ message: "There is no such event in our database" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}

const editBooked = async (req, res) => {
    try {
        console.log("ahsjkdfhjklasdhf");
        const {
            guestRequirement,
            cateringNeeds,
            eventName,
            eventCategory,
            venueName,
            venueType,
            noofGuests,
            numberOfServices,
            foodPreference,
            cuisines,
            desiredEntertainment,
            entertainer,
            eventTheme,
            otherTheme,
            audioVisual,
            techSupport,
            additionalRequirement,
            name,
            email,
            phoneNumber,
            alternativePhoneNumber,
        } = req.body

        const { eventId } = req.params

        const event = await Booking.findByIdAndUpdate({ _id: eventId }, {
            $set: {
                guestRequirement,
                cateringNeeds,
                eventCategory,
                venueName,
                venueType,
                noofGuests,
                numberOfServices,
                foodPreference,
                cuisines,
                desiredEntertainment,
                entertainer,
                eventTheme,
                otherTheme,
                // themeImage,
                audioVisual,
                techSupport,
                additionalRequirement,
                name,
                email,
                phoneNumber,
                alternativePhoneNumber,
                eventName,

            }
        })
        console.log(event);

        res.status(201).json({ message: "Updated Successfully" })


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}

const deleteBooked = async (req, res) => {
    try {
        const { eventId } = req.params
        const event = await Booking.findById(eventId)
        const eventStartDate = new Date(event.startDate);

        const today = new Date();
        const tenDaysAgo = new Date(today);
        tenDaysAgo.setDate(today.getDate() - 10);
        0


        // if (eventStartDate > tenDaysAgo) {

        const deleted = await Booking.findByIdAndDelete({ _id: eventId })
        if (!deleted) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json({ message: "Deleted Successfully" });
        // }else{
        //     res.status(409).json({message : "You can't cancel the event 10 days before of the event,Please contact customer care for cancallation procedure"})
        // }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}

const updateProfilePic = async (req, res) => {
    try {
        const { profile } = req.body
        const { customerId } = req.query
        const uploaded = await cloudinary.uploader.upload(profile, {
            public_id: `customerProfiles/${customerId}`,
            uload_preset: 'mi_default',

        })

        const updated = await Customer.findByIdAndUpdate(customerId, {
            $set: {
                profilePic: uploaded.secure_url
            },

        },
            { new: true })
        res.status(200).json({ message: "Profile Image updated successfully", customerData: updated })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}
const updateProfile = async (req, res) => {
    try {
        const { userName, mobile, email } = req.body
        const { customerId } = req.query

        const updated = await Customer.findByIdAndUpdate(customerId, {
            $set: {
                userName: userName,
                email: email,
                mobile: mobile
            }
        }, { new: true })

        res.status(200).json({ updated, message: "Profile details updated successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const { customerId } = req.query
        console.log(customerId);

        const customer = await Customer.findById(customerId)
        console.log(customer);
        const isPasswordMatched = await bcrypt.compare(currentPassword, customer.password)

        if (isPasswordMatched) {
            const hashPassword = await hash.hashPassword(newPassword, 10)
            await Customer.findByIdAndUpdate(customerId, {
                $set: {
                    password: hashPassword
                }
            })

            res.status(200).json({ message: "Password changed successfully" })
        } else {
            res.status(409).json({ message: "Current is wrong,try again" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })

    }
}

module.exports = {
    customerSignin,
    customerSignup,
    otpVerification,
    resendOtp,
    getEvents,
    createEvent,
    findCustomer,
    getBookings,
    getEvent,
    editBooked,
    deleteBooked,
    updateProfilePic,
    updateProfile,
    changePassword

}