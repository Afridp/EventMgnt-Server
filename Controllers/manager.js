const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cloudinary = require('../Utils/cloudinary');
const hash = require('../Utils/bcryptPassword')
const Otp = require('../Models/Otp');

const { default: Stripe } = require('stripe');
const { generateManagerUUID, generateEventUUID } = require('../Utils/UUID_Generator');
const { otpSendToMail, sendCredentialsToEmployee } = require('../Utils/mailSender')
const { switchDB, getDBModel, getDocument, getDocuments, getDocumentWithPopulate, deleteDocument, getCollection } = require('../Utils/dbHelper');

const { TenantSchemas, CompanySchemas } = require('../Utils/dbSchemas');

const API =  process.env.API_REQUEST_SOURCE

const defaults = async(req,res) => {
    try {
        res.send(process.env.STRIPE_SECRET_KEY)
    } catch (error) {
        console.log(error.message)
    }
}
// tenent signup
const managerSignup = async (req, res) => {
    try {
     
        const { signupData } = req.body
        const Manager = await getCollection('AppTenants','tenant', TenantSchemas)

        const existManager = await Manager.findOne({
            $or: [
                { companyMobile: signupData.cmobile },
                { companyEmail: signupData.cemail }
            ]
        })
        if (existManager) {
            //    TODO:this res is not working
            res.status(404).json({ message: "You have already registered with us ,Please Login to continue" })

        } else {
            const spassword = await hash.hashPassword(signupData.password)
            const uuid = await generateManagerUUID();
            const customerLink = `http://customer.${API}/${uuid}`

            const newManagr = new Manager({
                uuid: uuid,
                companyEmail: signupData.cemail,
                username: signupData.username,
                companyMobile: signupData.cmobile,
                password: spassword,
                isEmailVerified: false,
                subscribed: false,
                customerLink: customerLink,
                isBlocked: false
            })
            const createdTanent = await newManagr.save()

            const otpId = await otpSendToMail((await createdTanent).username, (await createdTanent).companyEmail, (await createdTanent)._id, "AppTenants")

            res.status(200).json({ managerId: (await createdTanent)._id, otpId, managerUUID: createdTanent.uuid, message: `otp has been sent to ${createdTanent.cemail}` })
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "internal server Error" })
    }
}

// tenant otp verification
const otpVerification = async (req, res) => {
    try {
        const { enteredOtp, managerId, otpId, amount, scheme } = req.body
        const Otp = await getCollection("AppTenants", 'otp', TenantSchemas)
        const Manager = await getCollection("AppTenants", 'tenant', TenantSchemas)

        const stripeInstance = Stripe(process.env.STRIPE_SECRET_KEY)

        const isOtp = await Otp.findOne({ _id: otpId })

        const correctOtp = isOtp.otp

        const { expiresAt } = isOtp

        if (correctOtp && expiresAt < Date.now()) {
            return res.status(403).json({ message: "Otp is expired" })
        }
        if (correctOtp === enteredOtp) {

            await Otp.deleteMany({ _id: otpId });

            await Manager.updateOne({ _id: managerId }, { $set: { isEmailVerified: true } });

            // const event = await Event.findById(eventId)
            // TODO: change the urls according to manager url when manager sharded
            let success_url = `http://${API}/?managerId=${managerId}&amount=${amount}&scheme=${scheme}`;
            let cancel_url = `http://${API}/dashboard`
            const lineItems = [{
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: `Choosed Plan ${scheme}`,

                    },
                    unit_amount: amount * 100
                },
                quantity: 1
            }]

            const session = await stripeInstance.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: lineItems,
                mode: "payment",
                success_url: success_url,
                cancel_url: cancel_url
            })

            res.status(200).json({ status: true, sessionId: session.id, message: "Registered succesfully" })
        } else {
            res.status(200).json({ status: false, message: "Incorrect Otp,try again" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" });
    }
}

// tenant subscription completing
const completeSubscription = async (req, res) => {
    try {
        const { managerId, scheme } = req.body
        
        const Manager = await getCollection("AppTenants", "tenant", TenantSchemas)
       
        let currentDate = new Date()

        let subscriptionEndDate

        if (scheme === "month") {

            subscriptionEndDate = new Date(currentDate)
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)

            const managerSubscribed = await Manager.findByIdAndUpdate(managerId, {
                $set: {
                    subscribed: true,
                    subscriptionPlan: scheme,
                    subscriptionStart: currentDate,
                    subscriptionEnd: subscriptionEndDate
                },
            }, { new: true })

            // const tenantId = await updatedTanent._id.toString()

            await switchDB(managerSubscribed.uuid, CompanySchemas)

            let endDate = subscriptionEndDate.toLocaleDateString("en-GB")

            res.status(200).json({ message: `Subscription successful. Your subscription ends at ${endDate}` })

        } else if (scheme === "year") {

            subscriptionEndDate = new Date(currentDate)
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)

            const managerSubscribed = await Manager.findByIdAndUpdate(managerId, {
                $set: {
                    subscribed: true,     
                    subscriptionPlan: scheme,
                    subscriptionStart: currentDate,
                    subscriptionEnd: subscriptionEndDate,
                   
                },
            }, { new: true })

            // const tenantId = await updatedTanent._id.toString()
            await switchDB(managerSubscribed.uuid, CompanySchemas)

            let endDate = subscriptionEndDate.toLocaleDateString("en-GB")

            res.status(200).json({ message: `Subscription successful. Your subscription ends at ${endDate}` })

        } else {
            res.status(400).json({ message: "Invalid subscription plan" });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// sigup resend otps 
const resendOtp = async (req, res) => {
    try {
        const { managerId } = req.body
        const Manager = await getCollection("AppTenants", 'tenant', TenantSchemas)

        const data = await Manager.findOne({ _id: managerId })

        const otpId = await otpSendToMail(data.username, data.companyEmail, data._id, "AppTenants")
        if (otpId) {
            res.status(200).json({ message: `New otp sent to ${data.companyEmail}` })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// tenant signing in
const managerSignin = async (req, res) => {
    try {
        const { signinDetails, password } = req.body
        const Manager = await getCollection("AppTenants", 'tenant', TenantSchemas)

        const isTenantExist = await Manager.findOne({
            $or: [
                { username: signinDetails },
                { companyEmail: signinDetails }
            ]
        })

        if (isTenantExist) {
            if (isTenantExist.subscribed) {
                if (isTenantExist.isEmailVerified) {
                    const isPassword = await bcrypt.compare(password, isTenantExist.password)
                    if (isPassword) {
                        const token = jwt.sign({ managerId: isTenantExist._id, role: "manager" }, process.env.TOKEN_KEY, { expiresIn: '1h' })
                        res.status(200).json({ managerData: isTenantExist, token, message: "login success" })
                    } else {
                        res.status(401).json({ message: "password is incorrect please try again" })
                    }
                } else {
                    res.status(403).json({ message: 'Sorry You cannot access until you verify account' })
                }
            } else {
                res.status(401).json({ message: "Sorry You haven't subscribed yet,Please Subscribe to our any plan" })
            }
        } else {
            res.status(401).json({ message: "You are not registered with us please register to login" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// const createSubdomain = async (req, res) => {
//     try {
//         const { domain, managerId } = req.body
//         const managerToUpdate = await getDocument({ _id: managerId }, "tenant", "AppTenants")
//         if (managerToUpdate) {
//             managerToUpdate['domain'] = domain
//             const saved = await managerToUpdate.save()
//             res.status(200).json({ message: "Subdomain Changed Successfully", domain: saved.domain })
//         }

//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// }

// manager fetching todays events 
const getTodaysEvents = async (req, res) => {
    try {
        const manager = req.headers.role
        const Bookings = await getCollection(manager, 'booking', CompanySchemas)

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to zero

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Get tomorrow's date


        // Convert string startDate to Date type using $toDate aggregation operator
        const todaysEvents = await Bookings.aggregate([
            {
                $addFields: {
                    "formattedStartDate": { $toDate: "$formData.Date.startDate" }
                }
            },
            {
                $match: {
                    "formattedStartDate": {
                        $gte: today, // Greater than or equal to today (inclusive)
                        $lt: tomorrow // Less than tomorrow (exclusive)
                    }
                }
            },
            {
                $lookup: {
                    from: "events", // The collection to join with
                    localField: "eventId", // The field from the input documents
                    foreignField: "_id", // The field from the documents of the "from" collection
                    as: "event" // The alias for the output array
                }
            },
            {
                $project: {
                    eventId: 1,
                    event: { $arrayElemAt: ["$event", 0] }, // Retrieve the first element from the 'event' array
                    formattedStartDate: 1
                    // You can include other fields here as needed
                }
            }
        ]);
        res.status(200).json({ todaysEvents });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// manager fetching upcoming events 
const getUpcomingEvents = async (req, res) => {
    try {
        const manager = req.headers.role
        const Bookings = await getCollection(manager, 'booking', CompanySchemas)

        const today = new Date()

        // const upcomingEvents = await Booking.find({
        //     'formData.Date.startDate': { $gte: today }
        // });

        const upcomingEvents = await Bookings.find().populate('eventId')

        // console.log(upcomingEvents.formData.Date.startDate);
        let events = []
        let a = upcomingEvents.map((event, i) => {
            let date = new Date(event.formData.Date.startDate)
            if (date > today) {
                events.push(event)
            }
        })
        res.status(200).json({ upcomingEvents: events })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// getiing manager's hosted event (my events)
const getEvents = async (req, res) => {
    try {
        const manager = req.headers.role
        const Event = await getCollection(manager, 'event', CompanySchemas)

        const events = await Event.find();
        res.status(200).json({ event: events });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// adding or hosting new event by manager
const addNewEvents = async (req, res) => {
    try {
        const manager = req.headers.role
        const { eventName, eventDescription, image } = req.body
        const Event = await getCollection(manager, 'event', CompanySchemas)

        const existEvent = await Event.findOne({ eventName: eventName })

        if (!existEvent) {
            const uuid = await generateEventUUID(manager)
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

// getting form of a hosted event
const getFormOfEvent = async (req, res) => {
    try {
        const manager = req.headers.role
        const { eventId } = req.query
        const Form = await getCollection(manager, 'form', CompanySchemas)

        const event = await Form.findOne({ eventId: eventId })
        if (!event?.formFields) {
            return res.status(200).json({ fields: [] })
        } else {
            res.status(200).json({ fields: event.formFields, isChecked: event.personalFormFields })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// submitting a new form for a hosted event
const submitFormOfEvent = async (req, res) => {
    try {
        const manager = req.headers.role
        const { eventId, fields, managerId, isChecked } = req.body
        const Form = await getCollection(manager, 'form', CompanySchemas)

        const isEventFormExist = await Form.findOne({ eventId: eventId })

        if (isEventFormExist) {
            await Form.findByIdAndUpdate(isEventFormExist._id, {
                $set: {
                    formFields: fields,
                    personalFormFields: isChecked
                }
            })
            res.status(200).json({ message: "successfully updated form" })
        } else {
            const createdForm = new Form({
                managerId: managerId,
                eventId: eventId,
                formFields: fields,
                personalFormFields: isChecked

            })
            await createdForm.save()

            await Event.findByIdAndUpdate(eventId, {
                $set: {
                    list: true
                }
            })
            res.status(200).json({ message: "successfully created form" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// to edit hosted event not done
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

// to list and unlist hosted event
const listingAndUnlist = async (req, res) => {
    try {
        const manager = req.headers.role
        const { eventId } = req.params;
        const Event = await getCollection(manager, 'event', CompanySchemas)

        // Find the current event by ID
        const currentEvent = await Event.findById(eventId)

        // Toggle the value of the List field
        const newListValue = !currentEvent.list;

        // Update the event with the new value of the List field
        await Event.findByIdAndUpdate(
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

// to get all bookings 
const fetchAllBooking = async (req, res) => {
    try {
        const manager = req.headers.role
        const Booking = await getCollection(manager, 'booking', CompanySchemas)

        const bookings = await Booking.find().populate("eventId")

        res.status(200).json({ bookings })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// to get new submissions of bookings
const getNewSubmissions = async (req, res) => {
    try {
        const manager = req.headers.role
        const FormSubmissions = await getCollection(manager, 'formSubmissions', CompanySchemas)

        const newSubmissions = await FormSubmissions.find().populate("eventId")
        if (newSubmissions) {
            res.status(200).json({ newSubmissions })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// to get event detatils of each submissions
const getEventData = async (req, res) => {
    try {
        const manager = req.headers.role
        const { eventId } = req.query
        const Booking = await getCollection(manager, "booking", CompanySchemas)

        const eventData = await Booking.findById(eventId)

        res.status(200).json({ eventData: eventData.formData, personalData: eventData.personalData })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// const subscriptionCheckout = async (req, res) => {
//     try {
//         const stripeInstance = Stripe(process.env.STRIPE_SECRET_KEY)
//         const { selectedPlan, amnt } = req.body

//         // const event = await Event.findById(eventId)
//         // TODO: change the urls according to manager url when manager sharded
//         let success_url = `http://localhost:3000/manager/subscibed?plan=${selectedPlan}`;
//         let cancel_url = `http://localhost:3000/manager/pro`
//         const lineItems = [{
//             price_data: {
//                 currency: "inr",
//                 product_data: {
//                     name: `Choosed Plan ${selectedPlan}`,

//                 },
//                 unit_amount: amnt * 100
//             },
//             quantity: 1
//         }]

//         const session = await stripeInstance.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: lineItems,
//             mode: "payment",
//             success_url: success_url,
//             cancel_url: cancel_url
//         })

//         res.status(200).json({ sessionId: session.id })
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "internal server Error" });
//     }
// }

// const manageSubscription = async (req, res) => {
//     try {
//         const { selectedPlan, managerId } = req.body

//         let currentDate = new Date()

//         let subscriptionEndDate

//         if (selectedPlan === "Trail") {

//             let trailEndDate = new Date()
//             trailEndDate.setDate(trailEndDate.getDate() + 30)


//             const managerSubscribed = await Manager.findByIdAndUpdate(managerId, {
//                 $set: {
//                     subscribed: true,
//                     subscriptionPlan: selectedPlan,
//                     subscriptionStart: currentDate,
//                     subscriptionEnd: trailEndDate,
//                     isTrailed: true
//                 },
//             }, { new: true })

//             let endDate = trailEndDate.toLocaleDateString("en-GB")

//             res.status(200).json({ message: `Yeeh..You have subscribed successfully. Your free trial ends at ${endDate}`, managerSubscribed })

//         } else if (selectedPlan === "Monthly") {

//             subscriptionEndDate = new Date(currentDate)
//             subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)


//             const managerSubscribed = await Manager.findByIdAndUpdate(managerId, {
//                 $set: {
//                     subscribed: true,
//                     subscriptionPlan: selectedPlan,
//                     subscriptionStart: currentDate,
//                     subscriptionEnd: subscriptionEndDate
//                 },
//             }, { new: true })

//             let endDate = subscriptionEndDate.toLocaleDateString("en-GB")

//             res.status(200).json({ message: `Subscription successful. Your subscription ends at ${endDate}`, managerSubscribed })

//         } else if (selectedPlan === "Yearly") {

//             subscriptionEndDate = new Date(currentDate)
//             subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)


//             const managerSubscribed = await Manager.findByIdAndUpdate(managerId, {
//                 $set: {
//                     subscribed: true,
//                     subscriptionPlan: selectedPlan,
//                     subscriptionStart: currentDate,
//                     subscriptionEnd: subscriptionEndDate
//                 },
//             }, { new: true })


//             let endDate = subscriptionEndDate.toLocaleDateString("en-GB")

//             res.status(200).json({ message: `Subscription successful. Your subscription ends at ${endDate}`, managerSubscribed })

//         } else {
//             res.status(400).json({ message: "Invalid subscription plan" });
//         }

//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// }


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

// to get all employees available
const getAllEmployees = async (req, res) => {
    try {
        const manager = req.headers.role
        const { search } = req.query;
        const Employee = await getCollection(manager, 'employee', CompanySchemas)

        let query = {};

        if (search) {
            query.name = { $regex: new RegExp(search, "i") };
        }
        const employees = await Employee.find(query);

        if (employees) {
            res.status(200).json({ employees });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// to block and unblock employees
const blockUnblockEmployee = async (req, res) => {
    try {
        const manager = req.headers.role
        const { employeeId } = req.query
        const Employee = await getCollection(manager, 'employee', CompanySchemas)


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

// to add employee
const addEmployee = async (req, res) => {
    try {
        const manager = req.headers.role
        const { email } = req.body
        const Employee = await getCollection(manager, 'employee', CompanySchemas)

        const isEmployeeExist = await Employee.findOne({ email: email })

        if (!isEmployeeExist) {
            const newEmployee = new Employee({
                email: email
            })
            await newEmployee.save()
            //    TODO:send created employee to frontend and update
           await sendCredentialsToEmployee(email, manager)
        
            res.status(200).json({ message: "successfully added new employee,Employee Id and password sented" })
        } else {
            res.status(409).json({ message: 'This email is already added,try to add a new one' })
        }
    } catch (error) {
        console.log(error.message, "the ivide");
        res.status(500).json({ message: "Internal Server Error" })
    } 
}

// to get employees for assgning a event
const getEmployees = async (req, res) => {
    try {
        const manager = req.headers.role
        const Employee = await getCollection(manager, 'employee', CompanySchemas)

        const employees = await Employee.find({}, { name: 1 })

        res.status(200).json({ employees })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// to approve events (orders)
const approveEvent = async (req, res) => {
    try {
        const manager = req.headers.role
        const { submissionId } = req.body
        const FormSubmissions = await getCollection(manager, "formSubmission", CompanySchemas)
        const Booking = await getCollection(manager, 'booking', CompanySchemas)

        const submission = await FormSubmissions.findById(submissionId)

        const newBooking = new Booking({
            customerId: submission.customerId,
            eventId: submission.eventId,
            // TODO: need to add manager id also
            formData: submission.formData,
            personalData: submission.personalData,
            paidAmount: submission.amountPaid
        })

        await newBooking.save()

        await FormSubmissions.findByIdAndDelete(submissionId)

        res.status(200).json({ updatedEvent: submissionId, message: "Approved" })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const fileUploads = async (req, res) => {
    try {
        const { logoBlob, homePageImageBlob, managerId } = req.body
        const Manager = await getCollection("AppTenants", "tenant", TenantSchemas)

        const logo = await cloudinary.uploader.upload(logoBlob, {
            public_id: `managerCustomers/logos/${managerId}`,
            // uload_preset: 'mi_default',
            // check what is upload preset is
        })

        const homePageImage = await cloudinary.uploader.upload(homePageImageBlob, {
            public_id: `managerCustomers/homePageImages/${managerId}`,
            // uload_preset: 'mi_default',
            // check what is upload preset is
        })

        await Manager.findByIdAndUpdate(managerId, {
            $set: {
                'customize.logo': logo.secure_url,
                'customize.homePageImage': homePageImage.secure_url
            }
        })

        res.status(200).json({ message: "Files uploaded succes", customerLink: Manager.customerLink })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const customizedAppearance = async (req, res) => {
    try {
        const { themeColor, managerId } = req.body
        const Manager = await getCollection("AppTenants", "tenant", TenantSchemas)

        await Manager.findByIdAndUpdate(managerId, {
            $set: {
                'customize.themeColor': themeColor
            }
        })
        res.status(200).json({ message: "Color Changed Success" })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const customizedContents = async (req, res) => {
    try {
        const { heading, paragraph, aboutUs, managerId } = req.body
        const Manager = await getCollection("AppTenants", "tenant", TenantSchemas)

        await Manager.findByIdAndUpdate(managerId, {
            $set: {
                'customize.heading' : heading,
                'customize.paragraph' : paragraph,
                'customize.aboutUs' : aboutUs
             }
        })
        res.status(200).json({ message: "Content Changed Successfully" })
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
    completeSubscription,
    // createSubdomain,
    addNewEvents,
    getEvents,
    editEvent,
    listingAndUnlist,
    fetchAllBooking,
    getEventData,
    getTodaysEvents,
    getUpcomingEvents,
    // manageSubscription,
    getAllEmployees,
    blockUnblockEmployee,
    getNewSubmissions,
    addEmployee,
    submitFormOfEvent,
    getFormOfEvent,
    getEmployees,
    approveEvent,
    fileUploads,
    customizedAppearance,
    customizedContents,
    defaults
}