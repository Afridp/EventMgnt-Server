const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator')
const otpModel = require('../Models/otpModel')
const dotenv = require('dotenv')
dotenv.config()

const sendToMail = async(username,email,managerId)=>{
    try {
        let transporter = nodemailer.createTransport({
            service : 'gmail',
            auth: {
                user : process.env.DEV_SMTP_EMAIL,
                pass : process.env.DEV_SMTP_PASSCODE
            }
        })

        let otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        let mailOptions = {
            from: 'androzer2@gmail.com',
            to: email,
            subject: 'Your otp',
            html: `  
            <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
              <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                <div style="border-bottom: 1px solid #eee">
                  <a href="" style="font-size: 1.4em; color: #82AE46; text-decoration: none; font-weight: 600">
                  NestWay
                  </a>
                </div>
                <p style="font-size: 1.1em">Hi,${username}</p>
                <p>Thank you for choosing NestWay. Use the following OTP to complete your Sign Up procedures. OTP is valid for a few minutes</p>
                <h2 style="background: #82AE46; margin: 0 auto; width: max-content; padding: 0 10px; color: white; border-radius: 4px;">
                  ${otp}
                </h2>
                <p style="font-size: 0.9em;">Regards,<br />NestWay</p>
                <hr style="border: none; border-top: 1px solid #eee" />
                <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                  <p>NestWay</p>
                  <p>1600 Ocean Of Heaven</p>
                  <p>Pacific</p>
                </div>
              </div>
            </div>
          `
        }

        const newOtp = new otpModel({
            managerId : managerId,
            otp : otp,
            createdAt : Date.now(),
            expiresAt : Date.now() + 300000
        })

    
        const otpSaved = await newOtp.save();
       
         

        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error);
            }else{
                console.log(`Email sent to ${info.response} and Otp is ${otp}`);
            }
        })
      
        return otpSaved._id

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = sendToMail