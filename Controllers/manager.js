const jwt = require('jsonwebtoken')

const Manager = require('../Models/Manager')
const Otp = require('../Models/Otp')
const Event = require('../Models/Event')
const Customer = require("../Models/Customer");
const Booking = require('../Models/Booking');
const Employees = require('../Models/Employee')
const { generateManagerUUID, generateEventUUID } = require('../Utils/UUID_Generator');
const bcrypt = require('bcryptjs')
const hash = require('../Utils/bcryptPassword')
const { otpSendToMail, sendCredentialsToEmployee } = require('../Utils/mailSender')
const cloudinary = require('../Utils/cloudinary');
const Employee = require('../Models/Employee');
const Form = require('../Models/Form');





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
            res.status(409).json({ message: "You have already registered with us,please login" })
        } else {
            const spassword = await hash.hashPassword(password)
            const uuid = await generateManagerUUID();
            const newManagr = new Manager({
                uuid: uuid,
                companyEmail: cemail,
                username: username,
                companyMobile: cmobile,
                password: spassword,
                isEmailVerified: false
            })

            const managerData = newManagr.save()

            const otpId = await otpSendToMail((await managerData).username, (await managerData).companyEmail, (await managerData)._id)

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


        let ManagerExist = await Manager.findOne({
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
        const { managerUUID, managerId } = req.query;
        // Find events where the UUID starts with the managerUUID
        const events = await Event.find({ managerId: managerId });
        res.status(200).json({ event: events });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const addNewEvents = async (req, res) => {
    try {
        const { eventName, eventDescription, image, managerUUID, managerId } = req.body
        const existEvent = await Event.findOne({ eventName: eventName })
        if (!existEvent) {
            const uuid = await generateEventUUID(managerUUID)

            const uploaded = await cloudinary.uploader.upload(image, {
                public_id: `events/${eventName}`,
                // uload_preset: 'mi_default',
                // check what is upload preset is
            })
            const newEvent = new Event({
                eventName,
                eventDescription,
                eventImage: uploaded.secure_url,
                uuid: uuid,
                managerId: managerId,
                list: false

                // imageBlob: image,
                // Save the Cloudinary URL in the database
            })
            const savedEvent = await newEvent.save()
            res.status(201).json({ message: 'Event added successfully', event: savedEvent });
        } else {
            res.status(403).json({ message: "Event you are trying to add is already exist,Try to add with new event" })
        }
    } catch (error) {
        console.error('Error adding new event:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getFormOfEvent = async (req, res) => {
    try {
        const { eventId } = req.query

        const event = await Form.findOne({ eventId: eventId })
        if (!event?.formFields) {
            return res.status(200).json({ fields: [] })
        }
        res.status(200).json({ fields: event.formFields , isChecked : event.personalFormFields})
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const submitFormOfEvent = async (req, res) => {
    try {
        const { eventId, fields, managerId, isChecked } = req.body

        const isEventFormExist = await Form.findOne({ eventId: eventId })

        if (isEventFormExist) {
            await Form.findByIdAndUpdate(isEventFormExist._id, {
                $set: {
                    formFields: fields,
                    personalFormFields : isChecked
                }
            })
            res.status(200).json({ message: "successfully updated form" })
        } else {
            const createdForm = new Form({
                managerId: managerId,
                eventId: eventId,
                formFields: fields,
                personalFormFields : isChecked

            })
            await createdForm.save()

            await Event.findByIdAndUpdate(eventId, {
                $set: {
                    list: true
                }
            })
            res.status(200).json({ message: "successfully created form" })
        }
        
        // await Forms.f({ uuid: eventUUID }, {
        //     $set: {
        //         form: fields,

        //         list: true
        //     }
        // })


    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
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
            eventId,
            { $set: { list: newListValue } },
            { new: true } // Returns the updated document
        );

        res.status(200).json({
            message: 'Event updated successfully',
            listValue: newListValue,

        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const fetchAllBooking = async (req, res) => {
    try {
        // const { managerId } = req.params

        const bookings = await Booking.find()

        res.status(200).json({ bookings })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getNewBookings = async (req, res) => {
    try {
        const newBookings = await Booking.find()
        if (newBookings) {
            res.status(200).json({ newBookings })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getEventData = async (req, res) => {
    try {
        const { eventId } = req.query

        const eventData = await Booking.findById(eventId)

        res.status(200).json({ eventData })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getTodaysEvents = async (req, res) => {
    try {
        // const today = new Date()
        // today.setDate(today.getDate() - 1); 
        // console.log(today);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to zero

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Get tomorrow's date

        // Find bookings where startDate falls within today's date
        const todaysEvents = await Booking.find({
            startDate: {
                $gte: today, // Greater than or equal to today (inclusive)
                $lt: tomorrow // Less than tomorrow (exclusive)
            }
        });

        // const todaysEvents = await Booking.find({ startDate: { $eq: today } })

        res.status(200).json({ todaysEvents })



    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getUpcomingEvents = async (req, res) => {
    try {
        const today = new Date()
        const upcomingEvents = await Booking.find({
            startDate: { $gte: today }
        })

        res.status(200).json({ upcomingEvents })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const manageSubscription = async (req, res) => {
    try {
        const { selectedPlan, managerId } = req.body

        let currentDate = new Date()

        let subscriptionEndDate

        if (selectedPlan === "Trail") {

            let trailEndDate = new Date()
            trailEndDate.setDate(trailEndDate.getDate() + 30)


            const managerSubscribed = await Manager.findByIdAndUpdate(managerId, {
                $set: {
                    subscribed: true,
                    subscriptionPlan: selectedPlan,
                    subscriptionStart: currentDate,
                    subscriptionEnd: trailEndDate,
                    isTrailed: true
                },
            }, { new: true })

            let endDate = trailEndDate.toLocaleDateString("en-GB")

            res.status(200).json({ message: `Yeeh..You have subscribed successfully. Your free trial ends at ${endDate}`, managerSubscribed })

        } else if (selectedPlan === "Monthly") {

            subscriptionEndDate = new Date(currentDate)
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)


            const managerSubscribed = await Manager.findByIdAndUpdate(managerId, {
                $set: {
                    subscribed: true,
                    subscriptionPlan: selectedPlan,
                    subscriptionStart: currentDate,
                    subscriptionEnd: subscriptionEndDate
                },
            }, { new: true })

            let endDate = subscriptionEndDate.toLocaleDateString("en-GB")

            res.status(200).json({ message: `Subscription successful. Your subscription ends at ${endDate}`, managerSubscribed })

        } else if (selectedPlan === "Yearly") {

            subscriptionEndDate = new Date(currentDate)
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)


            const managerSubscribed = await Manager.findByIdAndUpdate(managerId, {
                $set: {
                    subscribed: true,
                    subscriptionPlan: selectedPlan,
                    subscriptionStart: currentDate,
                    subscriptionEnd: subscriptionEndDate
                },
            }, { new: true })


            let endDate = subscriptionEndDate.toLocaleDateString("en-GB")

            res.status(200).json({ message: `Subscription successful. Your subscription ends at ${endDate}`, managerSubscribed })

        } else {
            res.status(400).json({ message: "Invalid subscription plan" });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// const isSubscribed = async (req, res) => {
//     try {

//         const managerId = req.headers.managerid
//         const manager = await Manager.findById(managerId)

//         if (manager.subscribed === false) {
//             res.status(200).json({ message: "you have not subscribed" })
//         } else {
//             res.status(100).json({ message: "you have done" })
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const getAllEmployees = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: new RegExp(search, "i") };
        }
        const employees = await Employees.find(query);

        if (employees) {
            res.status(200).json({ employees });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const blockUnblockEmployee = async (req, res) => {
    try {
        const { employeeId } = req.query

        const employeeToBlock = await Employee.findById(employeeId);

        // Toggle the value of the List field
        const newBlockValue = !employeeToBlock.isBlocked;
        // Update the event with the new value of the List field 
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $set: { isBlocked: newBlockValue } },
            { new: true } // Returns the updated document
        );

        res.status(200).json({
            message: 'Employee updated successfully',
            isBlocked: newBlockValue,
            employee: updatedEmployee,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


const addEmployee = async (req, res) => {
    try {
        const { email } = req.body

        const isEmployeeExist = await Employees.findOne({ email: email })

        if (!isEmployeeExist) {

            const newEmployee = new Employees({
                email: email
            })
            let employee = await newEmployee.save()

            const employeeId = await sendCredentialsToEmployee(employee.email)
            employee.employeeId = employeeId
            employee.employeePassword = employeeId

            employee.save()

            res.status(200).json({ message: "successfully added new employee,Employee Id and password sented" })
        } else {
            res.status(409).json({ message: 'This email is already added,try to add a new one' })
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}










module.exports = {
    managerSignup,
    managerSignin,
    otpVerification,
    resendOtp,
    addNewEvents,
    getEvents,
    editEvent,
    listingAndUnlist,
    fetchAllBooking,
    getEventData,
    getTodaysEvents,
    getUpcomingEvents,
    manageSubscription,
    getAllEmployees,
    blockUnblockEmployee,
    getNewBookings,
    addEmployee,
    // submitPersonalDetailsCheck,
    submitFormOfEvent,
    getFormOfEvent
}