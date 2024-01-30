const jwt = require('jsonwebtoken')


const Manager = require('../Models/Manager')
const Otp = require('../Models/Otp')
const Event = require('../Models/Event')
const Customer = require("../Models/Customer");


const bcrypt = require('bcryptjs')
const hash = require('../Utils/bcryptPassword')
const sendToMail = require('../Utils/mailSender')
const cloudinary = require('../Utils/cloudinary')





const managerSignup = async (req, res) => {
    try {
        const { cemail, username, cmobile, password } = req.body

        const existManager = await Manager.findOne({
            $or: [
                { companyMobile: cmobile },
                { companyEmail: cemail }
            ]
        })

        if (existManager) {
            res.status(409).json({ message: "you have already registered with us,please login" })
        } else {
            const spassword = await hash.hashPassword(password)

            const newManagr = new Manager({
                companyEmail: cemail,
                username: username,
                companyMobile: cmobile,
                password: spassword,
                isEmailVerified: false
            })

            const managerData = newManagr.save()

            // const token = jwt.sign({ managerId: managerData.id }, process.env.TOKEN_KEY, { expiresIn: '1h' })
            const otpId = await sendToMail((await managerData).username, (await managerData).companyEmail, (await managerData)._id)

            res.status(200).json({ managerId: (await managerData)._id, otpId, message: `otp has been sent to ${cemail}` })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}

const otpVerification = async (req, res) => {
    try {
        const { enteredOtp, managerId, otpId } = req.body

        const isOtp = await Otp.findOne({ _id: otpId })
        const correctOtp = isOtp.otp

        const { expiresAt } = isOtp

        if (correctOtp && expiresAt < Date.now()) {
            return res.status(403).json({ message: "Otp is expired" })
        }
        if (correctOtp === enteredOtp) {

            await Otp.deleteMany({ _id: otpId });
            await Manager.updateOne({ _id: managerId }, { $set: { isEmailVerified: true } });

            res.status(200).json({ status: true, message: "Registered succesfully You can login now" })
        } else {
            res.status(401).json({ status: true, message: "Incorrect Otp,try again" })
        }

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const resendOtp = async (req, res) => {
    try {
        const { managerId } = req.body

        const data = await Manager.findOne({ _id: managerId })

        const otpId = await sendToMail(data.username, data.companyEmail, data._id)
        if (otpId) {
            res.status(200).json({ message: `New otp sent to ${data.companyEmail}` })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const managerSignin = async (req, res) => {
    try {

        const { signinDetails, password } = req.body


        const ManagerExist = await Manager.findOne({
            $or: [
                { username: signinDetails },
                { companyEmail: signinDetails }
            ]
        })

        if (ManagerExist) {

            if (ManagerExist.isEmailVerified) {

                const isPassword = await bcrypt.compare(password, ManagerExist.password)

                if (isPassword) {
                    const token = jwt.sign({ managerId: ManagerExist._id, role: "manager" }, process.env.TOKEN_KEY, { expiresIn: '1h' })

                    res.status(200).json({ managerData: ManagerExist, token, message: "login success" })
                } else {
                    res.status(401).json({ message: "password is incorrect please try again" })
                }

            } else {
                res.status(403).json({ message: 'Sorry You cannot access until you verify account' })
            }
        } else {
            res.status(401).json({ message: "You are not registered with us please register to login" })
        }


    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
        res.status(200).json({ event: events })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const newEvents = async (req, res) => {
    try {
        const { eventName, eventDescription, image } = req.body

        const existEvent = await Event.findOne({ eventName: eventName })

        if (!existEvent) {
            const uploaded = await cloudinary.uploader.upload(image, {
                public_id: `events/${eventName}`,
                // uload_preset: 'mi_default',

                // check what is upload preset is

            })
            const newEvent = new Event({
                eventName,
                eventDescription,
                eventImage: uploaded.secure_url,
                // imageBlob: image,
                list: true
                // Save the Cloudinary URL in the database
            })

            const savedEvent = await newEvent.save()

            res.status(201).json({ message: 'Event added successfully', event: savedEvent });
        } else {
            res.status(403).json({ message: "Event you are trying to add is already exist" })
        }
    } catch (error) {
        console.error('Error adding new event:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const editEvent = async (req, res) => {
    try {
        const { eventName, eventDescription, _id } = req.body
        console.log(eventName, eventDescription, _id);

        const updated = await Event.findByIdAndUpdate({ _id: _id }, {
            $set: {
                eventName: eventName,
                eventDescription: eventDescription
            }
        })

        res.status(200).json({ event: updated, message: "Updated" })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const listingAndUnlist = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Find the current event by ID
        const currentEvent = await Event.findById(eventId);

        // Toggle the value of the List field
        const newListValue = !currentEvent.list;

        // Update the event with the new value of the List field
        const updatedEvent = await Event.findByIdAndUpdate(
            { _id: eventId },
            { $set: { list: newListValue } },
            { new: true } // Returns the updated document
        );

        res.status(200).json({
            message: 'Event updated successfully',
            event: updatedEvent,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const fetchAllBooking = async (req,res) => {
    try {
        // const { managerId } = req.params

        const bookings = await Bookings.find()
        res.status(200).json({bookings})

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports = {
    managerSignup,
    managerSignin,
    otpVerification,
    resendOtp,
    newEvents,
    getEvents,
    editEvent,
    listingAndUnlist,
    fetchAllBooking
}