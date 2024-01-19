const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const clientModel = require('../Models/clientModel')
const hash = require('../Utils/bcryptPassword')
const sendToMail = require('../Utils/mailSender')
const otpModel = require('../Models/otpModel')


const hashPassword = async (password) => {
    try {
        const phashed = await bcrypt.hash(password, 10)
        return phashed
    } catch (error) {
        console.log(error.message)
    }
}


const clientLogin = async (req, res) => {
    try {
        const { signinDetails, password } = req.body

        const existClient = await clientModel.findOne({
            $or: [
                { email: signinDetails },
                { username: signinDetails }
            ]
        })

        if (existClient) {

            if (existClient.isEmailVerified) {
                const isPassword = await bcrypt.compare(password, existClient.password)

                if (isPassword) {
                    const token = jwt.sign({ clientId: existClient._id, role: 'client' }, process.env.TOKEN_KEY, { expiresIn: '1h' })
                    res.status(200).json({ clientData: existClient, token, message: "login success" })
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
        const { enteredOtp, clientId, otpId } = req.body

        const isOtp = await otpModel.findOne({ _id: otpId })
        const correctOtp = isOtp.otp

        const { expiresAt } = isOtp

        if (correctOtp && expiresAt < Date.now()) {
            return res.status(403).json({ message: "Otp is expired" })
        }
        if (correctOtp === enteredOtp) {

            await otpModel.deleteMany({ _id: otpId });
            await clientModel.updateOne({ _id: clientId }, { $set: { isEmailVerified: true } });

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
        const { clientId } = req.body

        const data = await clientModel.findOne({ _id: clientId })

        const otpId = await sendToMail(data.username, data.email, data._id)
        if (otpId) {
            res.status(200).json({ message: `New otp sent to ${data.email}` })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const clientSignup = async (req, res) => {
    try {
        const { email, username, mobile, password } = req.body

        const existClient = await clientModel.findOne({
            $or: [
                { mobile: mobile },
                { email: email }
            ]
        })

        if (existClient) {
            res.status(409).json({ message: "you have already registered with us,please login" })
        } else {
            const spassword = await hash.hashPassword(password)

            const newClient = new clientModel({
                email: email,
                username: username,
                mobile: mobile,
                password: spassword,
                isEmailVerified: false
            })

            const clientData = newClient.save()

            // const token = jwt.sign({ managerId: managerData.id }, process.env.TOKEN_KEY, { expiresIn: '1h' })
            const otpId = await sendToMail((await clientData).username, (await clientData).email, (await clientData)._id)

            res.status(200).json({ clientId: (await clientData)._id, otpId, message: `otp has been sent to ${email}` })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server Error" })
    }
}



module.exports = {
    clientLogin,
    clientSignup,
    otpVerification,
    resendOtp,

}