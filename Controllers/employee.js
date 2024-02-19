const Employees = require("../Models/Employee")
const jwt = require('jsonwebtoken')


const generateToken = (employeeId, role) => {
    return jwt.sign({ employeeId, role }, process.env.TOKEN_KEY, { expiresIn: '1h' });
};

const employeeLogin = async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        const isEmployeeExist = await Employees.findOne({ employeeId });

        if (isEmployeeExist) {
            const isPassword = isEmployeeExist.employeePassword === password;

            if (isPassword) {
                const token = generateToken(isEmployeeExist._id, 'employee');
                res.status(200).json({ message: "Login Successful", token, employeeData: isEmployeeExist, isDataHave: isEmployeeExist.isDataHave });
            } else {
                res.status(409).json({ message: "Password is incorrect" });
            }
        } else {
            res.status(409).json({ message: "Sorry, not an employee" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const employeeSubmitDetails = async (req, res) => {
    try {
        const { name, phoneNumber, alternativePhoneNumber, age, gender, address, employeeId } = req.body;
        const updatedEmployee = await Employees.findByIdAndUpdate(employeeId, {
            $set: {
                name,
                address,
                age,
                gender,
                phoneNumber,
                alternativePhoneNumber,
                isDataHave: true
            }
        }, { new: true });
        const employee = await updatedEmployee.save();
        const token = generateToken(employee._id, 'employee');
        res.status(200).json({ message: "Data successfully saved", employeeData: employee, token });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports = {
    employeeLogin,
    employeeSubmitDetails
}