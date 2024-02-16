const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator')
const Otp = require('../Models/Otp')
const dotenv = require('dotenv')
const Employee = require('../Models/Employee')
dotenv.config()

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.DEV_SMTP_EMAIL,
    pass: process.env.DEV_SMTP_PASSCODE
  }
})

const otpSendToMail = async (username, email, accountId) => {
  try {
    let otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

    let mailOptions = {
      from: 'androzer2@gmail.com',
      to: email,
      subject: 'Your otp',
      html: `  
            <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
              <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                <div style="border-bottom: 1px solid #eee">
                  <a href="#" style="font-size: 1.4em; color: #790505; text-decoration: none; font-weight: 600">
                  Event Brigadge
                  </a>
                </div>
                <p style="font-size: 1.1em">Hi,${username}</p>
                <p>Thank you for choosing Event Brigadge. Use the following OTP to complete your Sign Up procedures. OTP is valid for a few minutes</p>
                <h2 style="background: #82AE46; margin: 0 auto; width: max-content; padding: 0 10px; color: white; border-radius: 4px;">
                  ${otp}
                </h2>
                <p style="font-size: 0.9em;">Regards,<br />Event Brigadge</p>
                <hr style="border: none; border-top: 1px solid #eee" />
                <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                  <p>Event Brigadge</p>
                 
                </div>
              </div>
            </div>
          `
    }
    const newOtp = new Otp({
      managerId: accountId,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000
    })

    const otpSaved = await newOtp.save();

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent to ${info.response} and Otp is ${otp}`);
      }
    })
    return otpSaved._id
  } catch (error) {
    console.log(error.message);
  }
}


const sendCredentialsToEmployee = async (email, name) => {
  try {
    function generateEmployeeId() {
      // Generate a random 5-digit number
      return `EM${Math.floor(10000 + Math.random() * 90000)}`;
    }

    async function generateUniqueEmployeeId() {
      let employeeId = "";
      let isUnique = false;

      // Generate a unique employee ID
      while (!isUnique) {
        employeeId = generateEmployeeId();
        // Check if the generated ID already exists in the database
        const existingEmployee = await Employee.findOne({ employeeId });
        if (!existingEmployee) {

          isUnique = true;
        }
      }

      return employeeId;
    }

    let employeeId = await generateUniqueEmployeeId()

    let mailOptions = {
      from: 'androzer2@gmail.com',
      to: email,
      subject: 'Your Login Credentials',
      html: `  
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
          <div style="margin: 50px auto; width: 70%; padding: 20px 0">
            <div style="border-bottom: 1px solid #eee">
              <a href="#" style="font-size: 1.4em; color: #790505; text-decoration: none; font-weight: 600">
                Event Brigadge
              </a>
            </div>
            <p style="font-size: 1.1em">Hi, ${name}</p>
            <p>We're excited to welcome you to Event Brigadge! Thank you for joining us.</p>
            <p>Your login credentials for Event Brigadge are:</p>
            <p><strong>Employee ID:</strong> ${employeeId}</p>
            <p><strong>Password:</strong> ${employeeId}</p>
            <p>Please use these credentials to log in to your account.</p>
            <p style="font-size: 0.9em;">If you have any questions or need assistance, feel free to reach out to us. We're here to help!</p>
            <p style="font-size: 0.9em;">Thanks again for choosing Event Brigadge. We look forward to seeing you around!</p>
            <p style="font-size: 0.9em;">Regards,<br />Event Brigadge Team</p>
            <hr style="border: none; border-top: 1px solid #eee" />
            <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
              <p>Event Brigadge</p>
            </div>
          </div>
        </div>
      `
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Credentilals sent to email and employeeId is ${employeeId}`);
      }
    })

    return
  } catch (error) {
    console.error(error.message, "this is probn")
  }
}


module.exports = {
  otpSendToMail,
  sendCredentialsToEmployee
}